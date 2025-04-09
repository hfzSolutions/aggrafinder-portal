-- Add is_admin_added column to ai_tools table
ALTER TABLE public.ai_tools ADD COLUMN is_admin_added BOOLEAN DEFAULT FALSE;

-- Update existing tools that were likely added by admins
-- This assumes tools without a user_id were added by admins
UPDATE public.ai_tools SET is_admin_added = TRUE WHERE user_id IS NULL;