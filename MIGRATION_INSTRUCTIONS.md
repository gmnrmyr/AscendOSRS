# 🛡️ Data Protection System - Migration Required

## 🚨 **Issue**
The versioning system needs to be set up in your database. This is a one-time setup that enables data protection and version history features.

## ✅ **Solution**

### **Option 1: Manual Migration (Recommended)**

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/hulnpsulovzyqcmroxir
2. **Navigate to**: SQL Editor (left sidebar)
3. **Copy this SQL script** and paste it in the editor:

```sql
-- ===================================================================
-- MANUAL MIGRATION: Add Data Versioning System
-- Run this in your Supabase SQL Editor to add data protection
-- ===================================================================

-- Step 1: Create data snapshots table
CREATE TABLE IF NOT EXISTS public.data_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  snapshot_type text NOT NULL CHECK (snapshot_type IN ('manual', 'auto', 'chunked')),
  snapshot_data jsonb NOT NULL,
  data_summary jsonb,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id, version_number)
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS data_snapshots_user_id_created_at_idx 
ON public.data_snapshots (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS data_snapshots_user_id_version_idx 
ON public.data_snapshots (user_id, version_number DESC);

-- Step 3: Enable Row Level Security
ALTER TABLE public.data_snapshots ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
DROP POLICY IF EXISTS "Users can view own snapshots" ON public.data_snapshots;
CREATE POLICY "Users can view own snapshots" ON public.data_snapshots 
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own snapshots" ON public.data_snapshots;
CREATE POLICY "Users can create own snapshots" ON public.data_snapshots 
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own snapshots" ON public.data_snapshots;
CREATE POLICY "Users can update own snapshots" ON public.data_snapshots 
  FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own snapshots" ON public.data_snapshots;
CREATE POLICY "Users can delete own snapshots" ON public.data_snapshots 
  FOR DELETE USING ((select auth.uid()) = user_id);

-- Step 5: Create snapshot creation function
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
  
  -- Collect current data from all tables
  WITH char_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'id', id,
      'name', name,
      'type', type,
      'combatLevel', combat_level,
      'totalLevel', total_level,
      'bank', bank,
      'notes', notes,
      'isActive', COALESCE(is_active, true),
      'platTokens', COALESCE(plat_tokens, 0)
    )) as data
    FROM public.characters 
    WHERE user_id = target_user_id
  ),
  method_data AS (
    SELECT jsonb_agg(jsonb_build_object(
      'id', id,
      'name', name,
      'character', character,
      'gpHour', gp_hour,
      'clickIntensity', click_intensity,
      'requirements', requirements,
      'notes', notes,
      'category', category,
      'isActive', COALESCE(is_active, true),
      'membership', CASE WHEN COALESCE(is_member, false) THEN 'p2p' ELSE 'f2p' END
    )) as data
    FROM public.money_methods 
    WHERE user_id = target_user_id
  ),
  goal_data AS (
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
  ),
  bank_data AS (
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
  ),
  settings_data AS (
    SELECT hours_per_day
    FROM public.user_settings 
    WHERE user_id = target_user_id
    LIMIT 1
  )
  SELECT jsonb_build_object(
    'characters', COALESCE(char_data.data, '[]'::jsonb),
    'moneyMethods', COALESCE(method_data.data, '[]'::jsonb),
    'purchaseGoals', COALESCE(goal_data.data, '[]'::jsonb),
    'bankData', COALESCE(bank_data.data, '{}'::jsonb),
    'hoursPerDay', COALESCE(settings_data.hours_per_day, 10)
  ) INTO current_data
  FROM char_data, method_data, goal_data, bank_data, settings_data;
  
  -- Calculate summary counts
  SELECT COUNT(*) INTO total_characters FROM public.characters WHERE user_id = target_user_id;
  SELECT COUNT(*) INTO total_methods FROM public.money_methods WHERE user_id = target_user_id;
  SELECT COUNT(*) INTO total_goals FROM public.purchase_goals WHERE user_id = target_user_id;
  SELECT COUNT(*) INTO total_bank_items FROM public.bank_items WHERE user_id = target_user_id;
  
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
    
    -- Clean up old snapshots (keep last 20 versions)
    DELETE FROM public.data_snapshots 
    WHERE user_id = target_user_id 
    AND version_number < (next_version - 20);
    
    RETURN snapshot_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create snapshot restore function
CREATE OR REPLACE FUNCTION public.restore_from_snapshot(
  snapshot_id uuid
) RETURNS jsonb AS $$
DECLARE
  snapshot_record record;
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

-- ===================================================================
-- MIGRATION COMPLETE
-- Your data versioning system is now ready!
-- ===================================================================
```

4. **Click "Run"** to execute the script
5. **Verify success**: You should see "Success. No rows returned"

### **Option 2: Using Migration Files (If you can access Docker)**

If you can run Docker locally:
```bash
cd supabase
npx supabase db reset
```

## 🎉 **After Migration**

Once the migration is complete, you'll have:

✅ **Data Protection**: Prevents accidental data loss  
✅ **Version History**: Browse and restore from previous saves  
✅ **Manual Backups**: Create snapshots anytime  
✅ **Automatic Backups**: Created before each save operation  

## 🔧 **Testing**

1. Refresh your app
2. Go to "Cloud Storage" section  
3. Click "Version History" - should work without errors
4. Try "Create Backup" - should create a manual snapshot

## ❓ **Need Help?**

If you encounter any issues:
1. Check the browser console for detailed error messages
2. Verify the SQL script ran without errors in Supabase
3. Make sure you're logged into the correct Supabase project

Your data is now fully protected! 🛡️ 