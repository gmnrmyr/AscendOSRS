-- Fix missing tables and columns for proper cloud save/load functionality

-- Create user_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  hours_per_day integer NOT NULL DEFAULT 10,
  preferences jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id)
);

-- Add missing columns to characters table
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS plat_tokens bigint NOT NULL DEFAULT 0;

-- Enable RLS for user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_settings
CREATE POLICY "Users can view own settings" ON public.user_settings 
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own settings" ON public.user_settings 
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings 
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own settings" ON public.user_settings 
  FOR DELETE USING ((select auth.uid()) = user_id);

-- Update existing characters to have is_active = true and plat_tokens = 0
UPDATE public.characters SET is_active = true WHERE is_active IS NULL;
UPDATE public.characters SET plat_tokens = 0 WHERE plat_tokens IS NULL;

-- Add is_member column to money_methods table
ALTER TABLE public.money_methods ADD COLUMN IF NOT EXISTS is_member boolean NOT NULL DEFAULT false;

-- Add is_active column to money_methods table
ALTER TABLE public.money_methods ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Add dummy_refresh_column to money_methods table
ALTER TABLE public.money_methods ADD COLUMN dummy_refresh_column boolean;
ALTER TABLE public.money_methods DROP COLUMN dummy_refresh_column;
