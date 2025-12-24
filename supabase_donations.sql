-- =============================================
-- DONATIONS TABLE
-- Run this in Supabase SQL Editor
-- =============================================

-- Create donations table
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  book_count INTEGER NOT NULL,
  book_titles TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'received', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit a donation
CREATE POLICY "Anyone can submit donation" ON public.donations
FOR INSERT WITH CHECK (true);

-- Policy: Admin can view all donations
CREATE POLICY "Admin view all donations" ON public.donations
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Policy: Admin can update donations
CREATE POLICY "Admin update donations" ON public.donations
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Policy: Admin can delete donations
CREATE POLICY "Admin delete donations" ON public.donations
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================
-- DONE! Run this in Supabase SQL Editor
-- =============================================
