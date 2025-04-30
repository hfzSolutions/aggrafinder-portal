-- Create enum type for event types
CREATE TYPE general_analytics_event_type AS ENUM (
  'newsletter',
  'sponsor_ad',
  'page_view',
  'traffic_source'
);

-- Create general_analytics table
CREATE TABLE general_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type general_analytics_event_type NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_general_analytics_event_type ON general_analytics(event_type);
CREATE INDEX idx_general_analytics_user_id ON general_analytics(user_id);
CREATE INDEX idx_general_analytics_created_at ON general_analytics(created_at);

-- Add RLS policies
ALTER TABLE general_analytics ENABLE ROW LEVEL SECURITY;

-- Allow insert for all authenticated users
CREATE POLICY "Allow insert for authenticated users"
  ON general_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow read access for admins only
CREATE POLICY "Allow read access for admins only"
  ON general_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_general_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
CREATE TRIGGER update_general_analytics_updated_at
  BEFORE UPDATE ON general_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_general_analytics_updated_at();