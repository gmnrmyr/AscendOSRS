
-- Create user profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create characters table
CREATE TABLE public.characters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('main', 'alt', 'ironman', 'hardcore', 'ultimate')),
  combat_level integer DEFAULT 0,
  total_level integer DEFAULT 0,
  bank bigint DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create money making methods table
CREATE TABLE public.money_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  character text NOT NULL,
  gp_hour integer NOT NULL DEFAULT 0,
  click_intensity integer NOT NULL CHECK (click_intensity IN (1, 2, 3, 4, 5)),
  requirements text DEFAULT '',
  notes text DEFAULT '',
  category text NOT NULL CHECK (category IN ('combat', 'skilling', 'pvm', 'merching')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create purchase goals table
CREATE TABLE public.purchase_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  current_price integer DEFAULT 0,
  target_price integer,
  quantity integer DEFAULT 1,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category text NOT NULL CHECK (category IN ('gear', 'consumables', 'misc')),
  notes text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create bank items table
CREATE TABLE public.bank_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  character text NOT NULL,
  name text NOT NULL,
  quantity integer DEFAULT 0,
  estimated_price integer DEFAULT 0,
  category text NOT NULL CHECK (category IN ('stackable', 'gear', 'consumables')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.money_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for characters
CREATE POLICY "Users can view own characters" ON public.characters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own characters" ON public.characters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own characters" ON public.characters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own characters" ON public.characters FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for money methods
CREATE POLICY "Users can view own money methods" ON public.money_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own money methods" ON public.money_methods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own money methods" ON public.money_methods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own money methods" ON public.money_methods FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for purchase goals
CREATE POLICY "Users can view own purchase goals" ON public.purchase_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own purchase goals" ON public.purchase_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own purchase goals" ON public.purchase_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own purchase goals" ON public.purchase_goals FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for bank items
CREATE POLICY "Users can view own bank items" ON public.bank_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bank items" ON public.bank_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bank items" ON public.bank_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bank items" ON public.bank_items FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
