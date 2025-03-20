-- Create tool_reviews table
CREATE TABLE IF NOT EXISTS public.tool_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.tool_reviews ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read reviews
CREATE POLICY "Anyone can view tool reviews" 
  ON public.tool_reviews 
  FOR SELECT 
  USING (true);

-- Create policy to allow users to create their own reviews
CREATE POLICY "Users can create their own reviews" 
  ON public.tool_reviews 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow users to update their own reviews
CREATE POLICY "Users can update their own reviews" 
  ON public.tool_reviews 
  FOR UPDATE 
  USING (auth.uid()::text = user_id OR auth.uid() IN 
    (SELECT user_id FROM public.admin_users));

-- Create policy to allow users to delete their own reviews
CREATE POLICY "Users can delete their own reviews" 
  ON public.tool_reviews 
  FOR DELETE 
  USING (auth.uid()::text = user_id OR auth.uid() IN 
    (SELECT user_id FROM public.admin_users));

-- Create index for faster queries
CREATE INDEX idx_tool_reviews_tool_id ON public.tool_reviews(tool_id);