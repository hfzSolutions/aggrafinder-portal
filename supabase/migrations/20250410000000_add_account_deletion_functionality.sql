
-- Create a function to handle account deletion
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete user's data from all tables
  -- This will cascade to delete profiles via FK constraint
  
  -- Delete user tool reviews
  DELETE FROM public.tool_reviews WHERE user_id = OLD.id;
  
  -- Delete user preferences
  DELETE FROM public.user_preferences WHERE user_id = OLD.id;
  
  -- Delete user from admin_users if they are an admin
  DELETE FROM public.admin_users WHERE user_id = OLD.id;
  
  -- Delete user's tool ownership claims
  DELETE FROM public.tool_ownership_claims WHERE user_id = OLD.id;
  
  -- Return the record being deleted
  RETURN OLD;
END;
$$;

-- Set up the trigger to run before a user is deleted
CREATE TRIGGER before_user_delete
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deletion();
