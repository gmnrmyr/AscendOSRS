
-- Fix the purchase_goals priority constraint to allow all the priority values used in the app
ALTER TABLE purchase_goals DROP CONSTRAINT IF EXISTS purchase_goals_priority_check;

-- Add a new constraint that allows all the priority values used in the frontend
ALTER TABLE purchase_goals ADD CONSTRAINT purchase_goals_priority_check 
CHECK (priority IN ('S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-'));

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can manage their own characters" ON characters;
DROP POLICY IF EXISTS "Users can manage their own money methods" ON money_methods;
DROP POLICY IF EXISTS "Users can manage their own purchase goals" ON purchase_goals;
DROP POLICY IF EXISTS "Users can manage their own bank items" ON bank_items;

-- Create RLS policies for characters table
CREATE POLICY "Users can manage their own characters" ON characters
FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for money_methods table
CREATE POLICY "Users can manage their own money methods" ON money_methods
FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for purchase_goals table
CREATE POLICY "Users can manage their own purchase goals" ON purchase_goals
FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for bank_items table
CREATE POLICY "Users can manage their own bank items" ON bank_items
FOR ALL USING (auth.uid() = user_id);
