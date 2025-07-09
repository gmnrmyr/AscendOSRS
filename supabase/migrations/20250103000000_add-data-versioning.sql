-- Add data versioning system to prevent data loss
-- Creates backup snapshots of user data before each save operation

-- Create data snapshots table for versioning
CREATE TABLE IF NOT EXISTS public.data_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  snapshot_type text NOT NULL CHECK (snapshot_type IN ('manual', 'auto', 'chunked')),
  snapshot_data jsonb NOT NULL,
  data_summary jsonb, -- Summary info like item counts, character names, etc.
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id, version_number)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS data_snapshots_user_id_created_at_idx ON public.data_snapshots (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS data_snapshots_user_id_version_idx ON public.data_snapshots (user_id, version_number DESC);
CREATE INDEX IF NOT EXISTS data_snapshots_user_id_type_created_idx ON public.data_snapshots (user_id, snapshot_type, created_at DESC);

-- Enable RLS
ALTER TABLE public.data_snapshots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for data snapshots
CREATE POLICY "Users can view own snapshots" ON public.data_snapshots 
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own snapshots" ON public.data_snapshots 
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own snapshots" ON public.data_snapshots 
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own snapshots" ON public.data_snapshots 
  FOR DELETE USING ((select auth.uid()) = user_id);

-- Function to automatically create snapshot before data changes
CREATE OR REPLACE FUNCTION public.create_data_snapshot_before_save(
  target_user_id uuid,
  snapshot_type text DEFAULT 'auto'
) RETURNS uuid AS $$
DECLARE
  snapshot_id uuid;
  next_version integer;
  current_data jsonb;
  summary_data jsonb;
  total_bank_items integer;
  total_characters integer;
  total_methods integer;
  total_goals integer;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 
  INTO next_version
  FROM public.data_snapshots 
  WHERE user_id = target_user_id;
  
  -- Collect current data
  SELECT jsonb_build_object(
    'characters', COALESCE(char_data.data, '[]'::jsonb),
    'moneyMethods', COALESCE(method_data.data, '[]'::jsonb),
    'purchaseGoals', COALESCE(goal_data.data, '[]'::jsonb),
    'bankData', COALESCE(bank_data.data, '{}'::jsonb),
    'hoursPerDay', COALESCE(settings_data.hours_per_day, 10)
  ) INTO current_data
  FROM (
    SELECT jsonb_agg(jsonb_build_object(
      'id', id,
      'name', name,
      'type', type,
      'combatLevel', combat_level,
      'totalLevel', total_level,
      'bank', bank,
      'notes', notes,
      'isActive', is_active,
      'platTokens', plat_tokens
    )) as data
    FROM public.characters 
    WHERE user_id = target_user_id
  ) char_data
  CROSS JOIN (
    SELECT jsonb_agg(jsonb_build_object(
      'id', id,
      'name', name,
      'character', character,
      'gpHour', gp_hour,
      'clickIntensity', click_intensity,
      'requirements', requirements,
      'notes', notes,
      'category', category,
      'isActive', is_active,
      'membership', CASE WHEN is_member THEN 'p2p' ELSE 'f2p' END
    )) as data
    FROM public.money_methods 
    WHERE user_id = target_user_id
  ) method_data
  CROSS JOIN (
    SELECT jsonb_agg(jsonb_build_object(
      'id', id,
      'name', name,
      'currentPrice', current_price,
      'targetPrice', target_price,
      'quantity', quantity,
      'priority', priority,
      'category', category,
      'notes', notes,
      'imageUrl', image_url
    )) as data
    FROM public.purchase_goals 
    WHERE user_id = target_user_id
  ) goal_data
  CROSS JOIN (
    SELECT jsonb_object_agg(
      character,
      character_items
    ) as data
    FROM (
      SELECT 
        character,
        jsonb_agg(jsonb_build_object(
          'id', id,
          'name', name,
          'quantity', quantity,
          'estimatedPrice', estimated_price,
          'category', category,
          'character', character
        )) as character_items
      FROM public.bank_items 
      WHERE user_id = target_user_id
      GROUP BY character
    ) grouped_items
  ) bank_data
  CROSS JOIN (
    SELECT hours_per_day
    FROM public.user_settings 
    WHERE user_id = target_user_id
    LIMIT 1
  ) settings_data;
  
  -- Calculate summary data
  SELECT 
    COUNT(*) INTO total_characters
  FROM public.characters 
  WHERE user_id = target_user_id;
  
  SELECT 
    COUNT(*) INTO total_methods
  FROM public.money_methods 
  WHERE user_id = target_user_id;
  
  SELECT 
    COUNT(*) INTO total_goals
  FROM public.purchase_goals 
  WHERE user_id = target_user_id;
  
  SELECT 
    COUNT(*) INTO total_bank_items
  FROM public.bank_items 
  WHERE user_id = target_user_id;
  
  SELECT jsonb_build_object(
    'totalCharacters', total_characters,
    'totalMethods', total_methods,
    'totalGoals', total_goals,
    'totalBankItems', total_bank_items,
    'snapshotType', snapshot_type,
    'hasData', (total_characters > 0 OR total_methods > 0 OR total_goals > 0 OR total_bank_items > 0)
  ) INTO summary_data;
  
  -- Only create snapshot if there's actual data to save
  IF (current_data->>'characters' != '[]' OR 
      current_data->>'moneyMethods' != '[]' OR 
      current_data->>'purchaseGoals' != '[]' OR 
      current_data->>'bankData' != '{}') THEN
    
    INSERT INTO public.data_snapshots (
      user_id, 
      version_number, 
      snapshot_type, 
      snapshot_data, 
      data_summary
    ) VALUES (
      target_user_id, 
      next_version, 
      snapshot_type, 
      current_data, 
      summary_data
    ) RETURNING id INTO snapshot_id;
    
    -- ENHANCED CLEANUP: Protect manual saves while cleaning automatic saves
    -- Clean up old automatic/chunked snapshots (keep last 20 versions)
    DELETE FROM public.data_snapshots 
    WHERE user_id = target_user_id 
    AND snapshot_type IN ('auto', 'chunked')
    AND version_number < (next_version - 20);
    
    -- MANUAL SAVE PROTECTION: Keep at least the last 2 manual saves
    -- Only delete manual saves if there are more than 2, and keep the 2 most recent
    DELETE FROM public.data_snapshots 
    WHERE user_id = target_user_id 
    AND snapshot_type = 'manual'
    AND id NOT IN (
      SELECT id 
      FROM public.data_snapshots 
      WHERE user_id = target_user_id 
      AND snapshot_type = 'manual'
      ORDER BY created_at DESC 
      LIMIT 2
    );
    
    RETURN snapshot_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore data from snapshot
CREATE OR REPLACE FUNCTION public.restore_from_snapshot(
  snapshot_id uuid
) RETURNS jsonb AS $$
DECLARE
  snapshot_record record;
  result jsonb;
BEGIN
  -- Get snapshot data
  SELECT * INTO snapshot_record
  FROM public.data_snapshots 
  WHERE id = snapshot_id 
  AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Snapshot not found or access denied';
  END IF;
  
  -- Return the snapshot data
  RETURN snapshot_record.snapshot_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 