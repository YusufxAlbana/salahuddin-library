-- =============================================
-- TAG MANAGEMENT SYSTEM
-- Run this SQL in Supabase SQL Editor
-- =============================================

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#6b7280',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create book_tags junction table (many-to-many)
CREATE TABLE IF NOT EXISTS public.book_tags (
  book_id INTEGER REFERENCES public.books(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (book_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_tags ENABLE ROW LEVEL SECURITY;

-- Policies for tags table
CREATE POLICY "Anyone can view tags" ON public.tags
FOR SELECT USING (true);

CREATE POLICY "Admin can insert tags" ON public.tags
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin can update tags" ON public.tags
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin can delete tags" ON public.tags
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for book_tags table
CREATE POLICY "Anyone can view book_tags" ON public.book_tags
FOR SELECT USING (true);

CREATE POLICY "Admin can insert book_tags" ON public.book_tags
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin can delete book_tags" ON public.book_tags
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Seed default tags
INSERT INTO public.tags (name, color) VALUES
  ('Novel', '#ef4444'),
  ('Why?', '#8b5cf6'),
  ('Konsep Pendidikan', '#3b82f6'),
  ('Self Motivation', '#f59e0b'),
  ('Islamic Book', '#10b981'),
  ('Islamic History', '#059669'),
  ('Sejarah', '#d97706'),
  ('Buku Belajar Bahasa', '#ec4899'),
  ('Buku Konsep Hidup', '#6366f1')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- DONE! Tags system is ready.
-- =============================================
