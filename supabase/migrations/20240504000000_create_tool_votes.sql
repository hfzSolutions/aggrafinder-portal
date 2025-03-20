-- Create tool_votes table
CREATE TABLE IF NOT EXISTS public.tool_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL,
  ip_address TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(tool_id, ip_address)
);

-- Create tool_vote_counts view for faster retrieval of vote counts
CREATE OR REPLACE VIEW public.tool_vote_counts AS
SELECT 
  tool_id,
  COUNT(*) FILTER (WHERE vote_type = 'upvote') AS upvotes,
  COUNT(*) FILTER (WHERE vote_type = 'downvote') AS downvotes,
  COUNT(*) FILTER (WHERE vote_type = 'upvote') - COUNT(*) FILTER (WHERE vote_type = 'downvote') AS vote_score
FROM public.tool_votes
GROUP BY tool_id;

-- Add RLS policies
ALTER TABLE public.tool_votes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read votes
CREATE POLICY "Anyone can view votes" 
  ON public.tool_votes 
  FOR SELECT 
  USING (true);

-- Create policy to allow users to create/update their own votes
CREATE POLICY "Users can create their own votes" 
  ON public.tool_votes 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow users to update their own votes
CREATE POLICY "Users can update their own votes" 
  ON public.tool_votes 
  FOR UPDATE 
  USING (true);

-- Create policy to allow users to delete their own votes
CREATE POLICY "Users can delete their own votes" 
  ON public.tool_votes 
  FOR DELETE 
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_tool_votes_tool_id ON public.tool_votes(tool_id);
CREATE INDEX idx_tool_votes_ip_address ON public.tool_votes(ip_address);