-- Add new columns for quick tools support
ALTER TABLE public.ai_tools
  -- Add tool_type column with check constraint
  ADD COLUMN tool_type text NOT NULL DEFAULT 'external' CHECK (tool_type IN ('external', 'quick')),
  -- Add is_public column for visibility control
  ADD COLUMN is_public boolean NOT NULL DEFAULT true,
  -- Add usage_count column to track tool usage
  ADD COLUMN usage_count integer NOT NULL DEFAULT 0,
  -- Add prompt column to store AI prompts
  ADD COLUMN prompt text;

-- Update existing tools to have 'external' type
UPDATE public.ai_tools
SET tool_type = 'external'
WHERE tool_type IS NULL;

-- Add index for tool_type for better query performance
CREATE INDEX idx_ai_tools_tool_type ON public.ai_tools(tool_type);

-- Add index for is_public for better query performance
CREATE INDEX idx_ai_tools_is_public ON public.ai_tools(is_public);