-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  preferred_categories TEXT[] DEFAULT '{}',
  preferred_pricing TEXT DEFAULT 'All',
  receive_recommendations BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own preferences
CREATE POLICY "Users can view their own preferences" 
  ON public.user_preferences 
  FOR SELECT 
  USING (auth.uid()::text = user_id OR auth.uid() IN 
    (SELECT user_id FROM public.admin_users));

-- Create policy to allow users to create their own preferences
CREATE POLICY "Users can create their own preferences" 
  ON public.user_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- Create policy to allow users to update their own preferences
CREATE POLICY "Users can update their own preferences" 
  ON public.user_preferences 
  FOR UPDATE 
  USING (auth.uid()::text = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);