-- Add country column to ai_tools table
ALTER TABLE public.ai_tools
  ADD COLUMN country text;

-- Add index for country for better query performance
CREATE INDEX idx_ai_tools_country ON public.ai_tools(country);

-- Update existing tools to have 'Global' as default country
UPDATE public.ai_tools
SET country = 'Global'
WHERE country IS NULL;

-- Set default value for future insertions
ALTER TABLE public.ai_tools
  ALTER COLUMN country SET DEFAULT 'Global';
