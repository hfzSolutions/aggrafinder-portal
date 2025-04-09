
-- Create a helper function to count pending ownership claims
CREATE OR REPLACE FUNCTION public.count_pending_claims()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  claim_count integer;
BEGIN
  -- Check if the table exists first
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tool_ownership_claims'
  ) THEN
    SELECT count(*)::integer INTO claim_count
    FROM public.tool_ownership_claims
    WHERE status = 'pending';
    
    RETURN claim_count;
  ELSE
    RETURN 0;
  END IF;
END;
$$;
