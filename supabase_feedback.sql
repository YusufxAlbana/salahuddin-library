-- =============================================
-- FEEDBACK TABLE
-- Run this in Supabase SQL Editor
-- =============================================

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit feedback
CREATE POLICY "Anyone can submit feedback" ON public.feedback
FOR INSERT WITH CHECK (true);

-- Policy: Admin can view all feedback
CREATE POLICY "Admin view all feedback" ON public.feedback
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Policy: Admin can update feedback (mark as read)
CREATE POLICY "Admin update feedback" ON public.feedback
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Policy: Admin can delete feedback
CREATE POLICY "Admin delete feedback" ON public.feedback
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================
-- DONE! Run this in Supabase SQL Editor
-- =============================================
