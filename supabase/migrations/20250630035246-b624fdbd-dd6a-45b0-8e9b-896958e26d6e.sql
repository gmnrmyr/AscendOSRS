
-- Fix RLS policies for all tables to work properly with Edge Functions
-- Drop existing policies that use auth.uid() directly
DROP POLICY IF EXISTS "Users can view their own characters" ON public.characters;
DROP POLICY IF EXISTS "Users can create their own characters" ON public.characters;
DROP POLICY IF EXISTS "Users can update their own characters" ON public.characters;
DROP POLICY IF EXISTS "Users can delete their own characters" ON public.characters;
DROP POLICY IF EXISTS "Users can manage their own characters" ON public.characters;

DROP POLICY IF EXISTS "Users can view their own money methods" ON public.money_methods;
DROP POLICY IF EXISTS "Users can create their own money methods" ON public.money_methods;
DROP POLICY IF EXISTS "Users can update their own money methods" ON public.money_methods;
DROP POLICY IF EXISTS "Users can delete their own money methods" ON public.money_methods;
DROP POLICY IF EXISTS "Users can manage their own money methods" ON public.money_methods;

DROP POLICY IF EXISTS "Users can view their own purchase goals" ON public.purchase_goals;
DROP POLICY IF EXISTS "Users can create their own purchase goals" ON public.purchase_goals;
DROP POLICY IF EXISTS "Users can update their own purchase goals" ON public.purchase_goals;
DROP POLICY IF EXISTS "Users can delete their own purchase goals" ON public.purchase_goals;
DROP POLICY IF EXISTS "Users can manage their own purchase goals" ON public.purchase_goals;

DROP POLICY IF EXISTS "Users can view their own bank items" ON public.bank_items;
DROP POLICY IF EXISTS "Users can create their own bank items" ON public.bank_items;
DROP POLICY IF EXISTS "Users can update their own bank items" ON public.bank_items;
DROP POLICY IF EXISTS "Users can delete their own bank items" ON public.bank_items;
DROP POLICY IF EXISTS "Users can manage their own bank items" ON public.bank_items;

-- Create new RLS policies using (select auth.uid()) pattern for Edge Function compatibility

-- Characters policies
CREATE POLICY "Users can view their own characters" 
  ON public.characters 
  FOR SELECT 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own characters" 
  ON public.characters 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own characters" 
  ON public.characters 
  FOR UPDATE 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own characters" 
  ON public.characters 
  FOR DELETE 
  USING ((select auth.uid()) = user_id);

-- Money methods policies
CREATE POLICY "Users can view their own money methods" 
  ON public.money_methods 
  FOR SELECT 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own money methods" 
  ON public.money_methods 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own money methods" 
  ON public.money_methods 
  FOR UPDATE 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own money methods" 
  ON public.money_methods 
  FOR DELETE 
  USING ((select auth.uid()) = user_id);

-- Purchase goals policies
CREATE POLICY "Users can view their own purchase goals" 
  ON public.purchase_goals 
  FOR SELECT 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own purchase goals" 
  ON public.purchase_goals 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own purchase goals" 
  ON public.purchase_goals 
  FOR UPDATE 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own purchase goals" 
  ON public.purchase_goals 
  FOR DELETE 
  USING ((select auth.uid()) = user_id);

-- Bank items policies
CREATE POLICY "Users can view their own bank items" 
  ON public.bank_items 
  FOR SELECT 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own bank items" 
  ON public.bank_items 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own bank items" 
  ON public.bank_items 
  FOR UPDATE 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own bank items" 
  ON public.bank_items 
  FOR DELETE 
  USING ((select auth.uid()) = user_id);
