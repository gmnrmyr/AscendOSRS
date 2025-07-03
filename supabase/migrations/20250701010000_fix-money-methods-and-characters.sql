-- 20250701-fix-money-methods-and-characters.sql
-- Add is_active to money_methods (for method active/inactive state)
ALTER TABLE public.money_methods ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Fix category constraint for money_methods to match frontend/app
ALTER TABLE public.money_methods DROP CONSTRAINT IF EXISTS money_methods_category_check;
ALTER TABLE public.money_methods ADD CONSTRAINT money_methods_category_check 
  CHECK (category IN ('combat', 'skilling', 'bossing', 'other'));

-- (Optional, but recommended) Add is_active to characters (for character active/inactive state)
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- (Optional, but recommended) Add plat_tokens to characters (for future-proofing bank token tracking)
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS plat_tokens bigint DEFAULT 0;

-- (Optional) Fix category constraint for bank_items to match all valid categories
ALTER TABLE public.bank_items DROP CONSTRAINT IF EXISTS bank_items_category_check;
ALTER TABLE public.bank_items ADD CONSTRAINT bank_items_category_check 
  CHECK (category = ANY (ARRAY['stackable'::text, 'gear'::text, 'materials'::text, 'other'::text]));
