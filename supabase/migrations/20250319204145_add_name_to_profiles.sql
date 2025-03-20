-- Add full_name and username columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create an index on username for faster lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- Add RLS policies for the new columns
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);