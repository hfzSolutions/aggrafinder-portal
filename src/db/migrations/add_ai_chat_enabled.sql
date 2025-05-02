-- Add aiChatEnabled column to ai_tools table
ALTER TABLE ai_tools ADD COLUMN IF NOT EXISTS ai_chat_enabled BOOLEAN DEFAULT true;

-- Update existing tools to have AI chat enabled by default
UPDATE ai_tools SET ai_chat_enabled = true WHERE ai_chat_enabled IS NULL;

-- Add comment to explain the purpose of this column
COMMENT ON COLUMN ai_tools.ai_chat_enabled IS 'Flag to enable AI chat feature for this tool';