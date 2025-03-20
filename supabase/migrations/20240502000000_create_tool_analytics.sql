-- Create tool_analytics table
CREATE TABLE IF NOT EXISTS public.tool_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.tool_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert analytics
CREATE POLICY "Anyone can insert analytics" 
  ON public.tool_analytics 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow only admins to view analytics
CREATE POLICY "Only admins can view analytics" 
  ON public.tool_analytics 
  FOR SELECT 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create index for faster queries
CREATE INDEX idx_tool_analytics_tool_id ON public.tool_analytics(tool_id);
CREATE INDEX idx_tool_analytics_action ON public.tool_analytics(action);
CREATE INDEX idx_tool_analytics_created_at ON public.tool_analytics(created_at);