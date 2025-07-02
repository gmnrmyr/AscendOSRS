-- 20250701-add-member-flag-thumbnails-preferences.sql
-- Add is_member to money_methods, purchase_goals, and bank_items for member/F2P distinction
ALTER TABLE public.money_methods ADD COLUMN IF NOT EXISTS is_member boolean NOT NULL DEFAULT false;
ALTER TABLE public.purchase_goals ADD COLUMN IF NOT EXISTS is_member boolean NOT NULL DEFAULT false;
ALTER TABLE public.bank_items ADD COLUMN IF NOT EXISTS is_member boolean NOT NULL DEFAULT false;

-- Add image_url for thumbnails to money_methods and bank_items
ALTER TABLE public.money_methods ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.bank_items ADD COLUMN IF NOT EXISTS image_url text;

-- Add preferences jsonb to user_settings for future user config
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS preferences jsonb;
