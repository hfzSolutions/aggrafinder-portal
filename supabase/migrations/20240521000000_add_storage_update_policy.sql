-- Add UPDATE policy for storage.objects to allow authenticated users to update their own files
CREATE POLICY "Allow owners to update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'assets' AND owner = auth.uid())
WITH CHECK (bucket_id = 'assets' AND owner = auth.uid());