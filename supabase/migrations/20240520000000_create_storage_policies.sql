-- Create storage bucket for tool images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assets' AND
  auth.role() = 'authenticated'
);

-- Policy to allow public access to files
CREATE POLICY "Allow public to view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'assets');

-- Policy to allow file owners to delete their files
CREATE POLICY "Allow owners to delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'assets' AND owner = auth.uid());