-- Create storage bucket for product media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-media',
    'product-media',
    true,
    20971520, -- 20MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 20971520,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/quicktime'];

-- Storage policies for product-media bucket
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-media');

-- Allow anyone to view public media
CREATE POLICY "Anyone can view product media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-media');

-- Allow users to delete their own uploaded files
CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-media' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Allow users to update their own uploaded files
CREATE POLICY "Users can update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-media' AND (auth.uid())::text = (storage.foldername(name))[1]);
