-- Fix Tags Access for Books Page
-- Run this in Supabase SQL Editor
-- NOTE: Your project uses 'tags' table, not 'categories'

-- Enable RLS on tags table (if not already enabled)
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy to ensure public access
DROP POLICY IF EXISTS "Anyone can view tags" ON tags;
CREATE POLICY "Anyone can view tags" 
ON tags FOR SELECT 
USING (true);

-- Enable RLS on book_tags junction table
ALTER TABLE book_tags ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view book_tags (needed for tag filtering)
DROP POLICY IF EXISTS "Anyone can view book_tags" ON book_tags;
CREATE POLICY "Anyone can view book_tags" 
ON book_tags FOR SELECT 
USING (true);
