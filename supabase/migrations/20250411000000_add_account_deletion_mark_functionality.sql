-- Create a table to store accounts pending deletion
CREATE TABLE IF NOT EXISTS public.accounts_pending_deletion (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  scheduled_deletion_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  deletion_reason TEXT,
  is_processed BOOLEAN DEFAULT FALSE
);

-- Add RLS policies to the accounts_pending_deletion table
ALTER TABLE public.accounts_pending_deletion ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own deletion requests
CREATE POLICY "Users can view their own deletion requests"
  ON public.accounts_pending_deletion
  FOR SELECT
  USING (auth.uid() = id);

-- Create a function to mark an account for deletion
CREATE OR REPLACE FUNCTION public.mark_account_for_deletion(
  user_id UUID,
  deletion_reason TEXT DEFAULT 'User requested deletion'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
    RAISE EXCEPTION 'User does not exist';
  END IF;
  
  -- Check if the user is already marked for deletion
  IF EXISTS (SELECT 1 FROM public.accounts_pending_deletion WHERE id = user_id) THEN
    RETURN FALSE;
  END IF;
  
  -- Mark the account for deletion
  INSERT INTO public.accounts_pending_deletion (id, deletion_reason)
  VALUES (user_id, deletion_reason);
  
  RETURN TRUE;
END;
$$;

-- Create a function to process accounts marked for deletion
CREATE OR REPLACE FUNCTION public.process_accounts_pending_deletion()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Process accounts that have reached their scheduled deletion date
  FOR user_record IN 
    SELECT id FROM public.accounts_pending_deletion 
    WHERE scheduled_deletion_at <= now() AND NOT is_processed
  LOOP
    -- Manually delete user data using the handle_user_deletion logic
    -- Delete user tool reviews
    DELETE FROM public.tool_reviews WHERE user_id = user_record.id;
    
    -- Delete user preferences
    DELETE FROM public.user_preferences WHERE user_id = user_record.id;
    
    -- Delete user from admin_users if they are an admin
    DELETE FROM public.admin_users WHERE user_id = user_record.id;
    
    -- Delete user's tool ownership claims
    DELETE FROM public.tool_ownership_claims WHERE user_id = user_record.id;
    
    -- Mark the account as processed
    UPDATE public.accounts_pending_deletion 
    SET is_processed = TRUE 
    WHERE id = user_record.id;
    
    -- Delete the user from auth.users
    -- This requires admin privileges and will be handled by a separate process
  END LOOP;
END;
$$;

-- Create a cron trigger to run the process_accounts_pending_deletion function daily
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'process-accounts-pending-deletion',
  '0 0 * * *',  -- Run at midnight every day
  $$
  SELECT public.process_accounts_pending_deletion();
  $$
);