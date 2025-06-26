
-- Add RLS policies for all tables to ensure cloud save/load works properly
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.money_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_items ENABLE ROW LEVEL SECURITY;

-- Characters policies
CREATE POLICY "Users can view their own characters" 
  ON public.characters 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own characters" 
  ON public.characters 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own characters" 
  ON public.characters 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own characters" 
  ON public.characters 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Money methods policies
CREATE POLICY "Users can view their own money methods" 
  ON public.money_methods 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own money methods" 
  ON public.money_methods 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own money methods" 
  ON public.money_methods 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own money methods" 
  ON public.money_methods 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Purchase goals policies
CREATE POLICY "Users can view their own purchase goals" 
  ON public.purchase_goals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchase goals" 
  ON public.purchase_goals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchase goals" 
  ON public.purchase_goals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchase goals" 
  ON public.purchase_goals 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Bank items policies
CREATE POLICY "Users can view their own bank items" 
  ON public.bank_items 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bank items" 
  ON public.bank_items 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank items" 
  ON public.bank_items 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank items" 
  ON public.bank_items 
  FOR DELETE 
  USING (auth.uid() = user_id);
