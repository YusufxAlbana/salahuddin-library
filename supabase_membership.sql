-- =============================================
-- MEMBERSHIP SYSTEM SCHEMA UPDATES
-- Run this SQL in Supabase SQL Editor
-- =============================================

-- Add new columns to users table for membership system
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS member_status text DEFAULT 'non-member' CHECK (member_status IN ('pending_approval', 'approved', 'verified', 'non-member')),
ADD COLUMN IF NOT EXISTS ktp_url text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'pending')),
ADD COLUMN IF NOT EXISTS payment_date timestamp with time zone;

-- Create storage bucket for KTP uploads (run this separately in Supabase Dashboard > Storage)
-- Or use the Supabase JS client to create bucket programmatically

-- Storage bucket policy (run in SQL editor after creating bucket 'ktp-uploads')
-- INSERT INTO storage.buckets (id, name, public) VALUES ('ktp-uploads', 'ktp-uploads', false);

-- Storage policies for ktp-uploads bucket
-- Allow authenticated users to upload their own KTP
-- CREATE POLICY "Users can upload their own KTP" ON storage.objects 
-- FOR INSERT WITH CHECK (
--   bucket_id = 'ktp-uploads' AND 
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Allow users to view their own KTP
-- CREATE POLICY "Users can view their own KTP" ON storage.objects 
-- FOR SELECT USING (
--   bucket_id = 'ktp-uploads' AND 
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Allow admins to view all KTPs
-- CREATE POLICY "Admins can view all KTPs" ON storage.objects 
-- FOR SELECT USING (
--   bucket_id = 'ktp-uploads' AND 
--   EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
-- );
