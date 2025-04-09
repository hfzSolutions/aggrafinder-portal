
-- Create a function to safely insert tool ownership claims
CREATE OR REPLACE FUNCTION public.create_tool_ownership_claim(
  p_tool_id UUID,
  p_user_id UUID,
  p_submitter_name TEXT,
  p_submitter_email TEXT,
  p_verification_details TEXT
) 
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.tool_ownership_claims (
    tool_id,
    user_id,
    submitter_name,
    submitter_email,
    verification_details,
    status
  ) VALUES (
    p_tool_id,
    p_user_id,
    p_submitter_name,
    p_submitter_email,
    p_verification_details,
    'pending'
  );
END;
$$;
