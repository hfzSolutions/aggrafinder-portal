-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Grant necessary privileges
GRANT SELECT ON public.admin_users TO authenticated;

-- Create policy to allow admins to see all admin users
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER 
STABLE 
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = auth.uid()
  )
$$;

CREATE POLICY "Admins can see all admin users" 
  ON public.admin_users 
  FOR SELECT 
  USING (is_admin());

-- Create policy to allow admins to insert new admin users
CREATE POLICY "Admins can insert admin users" 
  ON public.admin_users 
  FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create policy to allow admins to update admin users
CREATE POLICY "Admins can update admin users" 
  ON public.admin_users 
  FOR UPDATE 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create policy to allow admins to delete admin users
CREATE POLICY "Admins can delete admin users" 
  ON public.admin_users 
  FOR DELETE 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));