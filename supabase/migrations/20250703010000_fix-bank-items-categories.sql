-- Fix bank_items category constraint to match frontend categories
-- Frontend uses: 'stackable', 'gear', 'materials', 'other'
-- Database currently allows: 'stackable', 'gear', 'consumables'

-- Drop the old constraint
ALTER TABLE public.bank_items DROP CONSTRAINT IF EXISTS bank_items_category_check;

-- Add the new constraint with the correct categories
ALTER TABLE public.bank_items ADD CONSTRAINT bank_items_category_check 
  CHECK (category IN ('stackable', 'gear', 'materials', 'other'));

-- Update any existing items with 'consumables' category to 'materials'
UPDATE public.bank_items SET category = 'materials' WHERE category = 'consumables'; 