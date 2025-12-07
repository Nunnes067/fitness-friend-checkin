-- Add photo_url column to check_ins table if it doesn't exist
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS photo_url text;

-- Create storage bucket for check-in photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('check-ins', 'check-ins', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for check-ins bucket
CREATE POLICY "Anyone can view check-in photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'check-ins');

CREATE POLICY "Authenticated users can upload check-in photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'check-ins' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own check-in photos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'check-ins' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Users can delete their own check-in photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'check-ins' AND auth.uid()::text = (storage.foldername(name))[2]);

-- Storage policies for avatars bucket
CREATE POLICY "Anyone can view avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatars" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);