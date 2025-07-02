-- Add is_active column to money_methods table
ALTER TABLE money_methods
ADD COLUMN is_active boolean DEFAULT true NOT NULL;
