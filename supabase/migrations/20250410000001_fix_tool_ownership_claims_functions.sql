
-- Function to count pending ownership claims
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

-- Function to get tool ownership claims with related tool data
CREATE OR REPLACE FUNCTION public.get_tool_ownership_claims_with_tools()
RETURNS TABLE (
  id uuid,
  tool_id uuid,
  user_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  verification_details text,
  status text,
  admin_feedback text,
  submitter_name text,
  submitter_email text,
  tool_name text,
  tool_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id, 
    c.tool_id, 
    c.user_id, 
    c.created_at, 
    c.updated_at, 
    c.verification_details, 
    c.status, 
    c.admin_feedback, 
    c.submitter_name, 
    c.submitter_email,
    t.name AS tool_name,
    t.url AS tool_url
  FROM 
    public.tool_ownership_claims c
    LEFT JOIN public.ai_tools t ON c.tool_id = t.id
  ORDER BY 
    c.created_at DESC;
END;
$$;

-- Function to update tool ownership claim status
CREATE OR REPLACE FUNCTION public.update_tool_ownership_claim_status(
  p_claim_id uuid,
  p_status text,
  p_admin_feedback text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.tool_ownership_claims
  SET 
    status = p_status,
    admin_feedback = p_admin_feedback,
    updated_at = now()
  WHERE id = p_claim_id;
END;
$$;

-- Function to approve a tool ownership claim
CREATE OR REPLACE FUNCTION public.approve_tool_ownership_claim(
  p_claim_id uuid,
  p_admin_feedback text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_tool_id uuid;
BEGIN
  -- Get the user_id and tool_id from the claim
  SELECT user_id, tool_id INTO v_user_id, v_tool_id
  FROM public.tool_ownership_claims
  WHERE id = p_claim_id;
  
  -- Update the claim status
  UPDATE public.tool_ownership_claims
  SET 
    status = 'approved',
    admin_feedback = p_admin_feedback,
    updated_at = now()
  WHERE id = p_claim_id;
  
  -- Update the tool to set the user as the owner
  UPDATE public.ai_tools
  SET 
    user_id = v_user_id,
    is_admin_added = false  -- Since now it has a real owner
  WHERE id = v_tool_id;
END;
$$;

-- Function to create a tool ownership claim
CREATE OR REPLACE FUNCTION public.create_tool_ownership_claim(
  p_tool_id uuid,
  p_user_id uuid,
  p_verification_details text,
  p_submitter_name text,
  p_submitter_email text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_claim_id uuid;
BEGIN
  -- Check if a claim already exists for this tool and user
  IF EXISTS (
    SELECT 1 FROM public.tool_ownership_claims
    WHERE tool_id = p_tool_id AND user_id = p_user_id
  ) THEN
    -- Return the existing claim id
    SELECT id INTO v_claim_id
    FROM public.tool_ownership_claims
    WHERE tool_id = p_tool_id AND user_id = p_user_id;
    
    RETURN v_claim_id;
  END IF;
  
  -- Create a new claim
  INSERT INTO public.tool_ownership_claims (
    tool_id,
    user_id,
    verification_details,
    submitter_name,
    submitter_email
  ) VALUES (
    p_tool_id,
    p_user_id,
    p_verification_details,
    p_submitter_name,
    p_submitter_email
  )
  RETURNING id INTO v_claim_id;
  
  RETURN v_claim_id;
END;
$$;
