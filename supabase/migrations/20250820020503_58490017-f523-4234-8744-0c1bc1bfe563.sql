-- Create RLS policies for chat-temp bucket uploads
CREATE POLICY "Allow authenticated users to upload to temp-uploads" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'chat-temp' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'temp-uploads'
);

CREATE POLICY "Allow authenticated users to read temp-uploads" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'chat-temp' 
  AND (storage.foldername(name))[1] = 'temp-uploads'
);

CREATE POLICY "Allow authenticated users to delete temp-uploads" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'chat-temp' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = 'temp-uploads'
);