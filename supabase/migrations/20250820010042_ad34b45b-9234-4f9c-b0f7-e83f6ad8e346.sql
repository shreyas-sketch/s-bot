-- Create storage bucket for temporary chat images
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-temp', 'chat-temp', true);

-- Create policies for chat-temp bucket
CREATE POLICY "Users can upload their own temp images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'chat-temp' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Temp images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-temp');

CREATE POLICY "Users can delete their own temp images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'chat-temp' AND auth.uid()::text = (storage.foldername(name))[1]);