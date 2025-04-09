
-- Create a function to fetch tool ownership claims with tool names
CREATE OR REPLACE FUNCTION public.get_tool_ownership_claims_with_tools()
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    json_build_object(
      'id', toc.id,
      'tool_id', toc.tool_id,
      'user_id', toc.user_id,
      'submitter_name', toc.submitter_name,
      'submitter_email', toc.submitter_email,
      'verification_details', toc.verification_details,
      'status', toc.status,
      'created_at', toc.created_at,
      'updated_at', toc.updated_at,
      'admin_feedback', toc.admin_feedback,
      'ai_tools', json_build_object('name', t.name)
    )
  FROM 
    tool_ownership_claims toc
  JOIN
    ai_tools t ON toc.tool_id = t.id
  ORDER BY
    toc.created_at DESC;
END;
$$;

-- Create a function to update a tool ownership claim's status
CREATE OR REPLACE FUNCTION public.update_tool_ownership_claim_status(
  p_claim_id UUID,
  p_status TEXT,
  p_admin_feedback TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.tool_ownership_claims
  SET 
    status = p_status,
    updated_at = NOW(),
    admin_feedback = p_admin_feedback
  WHERE 
    id = p_claim_id;
END;
$$;

-- Create a function to approve a tool ownership claim and transfer tool ownership
CREATE OR REPLACE FUNCTION public.approve_tool_ownership_claim(
  p_claim_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tool_id UUID;
  v_user_id UUID;
BEGIN
  -- Get the tool_id and user_id from the claim
  SELECT tool_id, user_id INTO v_tool_id, v_user_id
  FROM public.tool_ownership_claims
  WHERE id = p_claim_id;
  
  -- Update the tool's ownership
  UPDATE public.ai_tools
  SET 
    user_id = v_user_id,
    is_admin_added = FALSE
  WHERE 
    id = v_tool_id;
END;
$$;
