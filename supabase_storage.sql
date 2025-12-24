-- Create a new storage bucket for book covers
INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-covers', 'book-covers', true);

-- Policy: Public access to view/download images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'book-covers' );

-- Policy: Authenticated users (Admin) can upload images
CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'book-covers' AND auth.role() = 'authenticated' );

-- Policy: Admin can update images
CREATE POLICY "Admin Update" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'book-covers' AND auth.role() = 'authenticated' );

-- Policy: Admin can delete images
CREATE POLICY "Admin Delete" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'book-covers' AND auth.role() = 'authenticated' );
