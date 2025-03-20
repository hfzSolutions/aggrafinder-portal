-- Enable RLS for admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy: Only admins can view admin users
CREATE POLICY "Only admins can view admin users" 
  ON public.admin_users 
  FOR SELECT 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create policy: Only admins can add admin users
CREATE POLICY "Only admins can add admin users" 
  ON public.admin_users 
  FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create policy: Only admins can update admin users
CREATE POLICY "Only admins can update admin users" 
  ON public.admin_users 
  FOR UPDATE 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create policy: Only admins can delete admin users
CREATE POLICY "Only admins can delete admin users" 
  ON public.admin_users 
  FOR DELETE 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create index for admin user queries
CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);