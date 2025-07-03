-- Fix bank_items category constraint to match application categories
-- Drop the old constraint
ALTER TABLE public.bank_items DROP CONSTRAINT IF EXISTS bank_items_category_check;

-- Add the new constraint with all valid categories used by the application
ALTER TABLE public.bank_items ADD CONSTRAINT bank_items_category_check 
CHECK (category = ANY (ARRAY['stackable'::text, 'gear'::text, 'materials'::text, 'other'::text]));