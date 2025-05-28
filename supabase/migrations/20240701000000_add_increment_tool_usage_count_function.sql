-- Create a function to increment the usage_count for a tool
CREATE OR REPLACE FUNCTION public.increment_tool_usage_count(tool_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the usage_count for the specified tool
  UPDATE public.ai_tools
  SET usage_count = COALESCE(usage_count, 0) + 1
  WHERE id = tool_id;
END;
$$;