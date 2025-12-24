-- =============================================
-- SAMPLE BOOKS DATA
-- Run this in Supabase SQL Editor
-- =============================================

-- Insert sample books
INSERT INTO public.books (title, author, category, year, stock, cover) VALUES
-- Novel
('Laskar Pelangi', 'Andrea Hirata', 'novel', 2005, 5, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1298560121i/1362193.jpg'),
('Bumi Manusia', 'Pramoedya Ananta Toer', 'novel', 1980, 4, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1301860126i/1398034.jpg'),
('Ayat-Ayat Cinta', 'Habiburrahman El Shirazy', 'novel', 2004, 6, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388197943i/1193970.jpg'),
('Negeri 5 Menara', 'Ahmad Fuadi', 'novel', 2009, 4, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320518156i/6320663.jpg'),
('Perahu Kertas', 'Dee Lestari', 'novel', 2009, 3, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1357173582i/6949693.jpg'),

-- Why? (Motivasi/Pengetahuan)
('Start With Why', 'Simon Sinek', 'why', 2009, 3, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1360936414i/7108725.jpg'),
('Thinking Fast and Slow', 'Daniel Kahneman', 'why', 2011, 2, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1317793965i/11468377.jpg'),
('Sapiens', 'Yuval Noah Harari', 'why', 2011, 4, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1420585954i/23692271.jpg'),

-- Konsep Pendidikan
('Pedagogy of the Oppressed', 'Paulo Freire', 'konsep-pendidikan', 1968, 2, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388180227i/72657.jpg'),
('Sekolah Itu Candu', 'Roem Topatimasang', 'konsep-pendidikan', 1998, 3, 'https://upload.wikimedia.org/wikipedia/id/5/5a/Sekolah_itu_Candu.jpg'),
('Totto-chan', 'Tetsuko Kuroyanagi', 'konsep-pendidikan', 1981, 5, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1474152466i/328802.jpg'),

-- Self Motivation
('Atomic Habits', 'James Clear', 'self-motivation', 2018, 6, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg'),
('The 7 Habits of Highly Effective People', 'Stephen Covey', 'self-motivation', 1989, 4, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1421842784i/36072.jpg'),
('Mindset', 'Carol Dweck', 'self-motivation', 2006, 3, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1436227012i/40745.jpg'),
('Rich Dad Poor Dad', 'Robert Kiyosaki', 'self-motivation', 1997, 5, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388211242i/69571.jpg'),

-- Islamic Book
('Ihya Ulumuddin', 'Imam Al-Ghazali', 'islamic-book', 1111, 3, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348730355i/90667.jpg'),
('Fiqih Sunnah', 'Sayyid Sabiq', 'islamic-book', 1945, 4, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348816665i/1139498.jpg'),
('La Tahzan', 'Aidh al-Qarni', 'islamic-book', 2003, 5, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1391271428i/1173461.jpg'),
('Tafsir Ibnu Katsir', 'Ibnu Katsir', 'islamic-book', 1370, 2, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1328867891i/205732.jpg'),

-- Islamic History
('Sirah Nabawiyah', 'Ibnu Hisyam', 'islamic-history', 828, 3, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1403181314i/1457676.jpg'),
('Khulafaur Rasyidin', 'Khalid Muhammad Khalid', 'islamic-history', 1955, 4, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327891839i/856566.jpg'),
('Sejarah Peradaban Islam', 'Badri Yatim', 'islamic-history', 1993, 5, 'https://upload.wikimedia.org/wikipedia/id/6/69/SPIslamBadriYatim.jpg'),

-- Sejarah
('Sejarah Indonesia Modern', 'M.C. Ricklefs', 'sejarah', 1981, 3, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1347809547i/99444.jpg'),
('Guns, Germs, and Steel', 'Jared Diamond', 'sejarah', 1997, 2, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1453215833i/1842.jpg'),
('Indonesia Etc.', 'Elizabeth Pisani', 'sejarah', 2014, 4, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388351949i/18454791.jpg'),

-- Buku Belajar Bahasa
('English Grammar in Use', 'Raymond Murphy', 'belajar-bahasa', 1985, 6, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1328870157i/19954.jpg'),
('Kamus Besar Bahasa Indonesia', 'Tim Penyusun KBBI', 'belajar-bahasa', 1988, 3, 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/KBBI_Daring.png/220px-KBBI_Daring.png'),
('Nihongo Sou Matome', 'Hitoko Sasaki', 'belajar-bahasa', 2010, 4, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1358177573i/6544212.jpg'),

-- Buku Konsep Hidup
('Filosofi Teras', 'Henry Manampiring', 'konsep-hidup', 2018, 5, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1544428854i/42861019.jpg'),
('Sebuah Seni untuk Bersikap Bodo Amat', 'Mark Manson', 'konsep-hidup', 2016, 4, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1465761302i/28257707.jpg'),
('Ikigai', 'Hector Garcia', 'konsep-hidup', 2016, 3, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1503433671i/36001608.jpg'),
('Man Search for Meaning', 'Viktor Frankl', 'konsep-hidup', 1946, 2, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1535419394i/4069.jpg')
ON CONFLICT DO NOTHING;

-- =============================================
-- Now assign books to tags
-- First, get the tag IDs and book IDs
-- =============================================

-- Assign books to Novel tag
INSERT INTO public.book_tags (book_id, tag_id)
SELECT b.id, t.id FROM public.books b, public.tags t 
WHERE b.category = 'novel' AND t.name = 'Novel'
ON CONFLICT DO NOTHING;

-- Assign books to Why? tag
INSERT INTO public.book_tags (book_id, tag_id)
SELECT b.id, t.id FROM public.books b, public.tags t 
WHERE b.category = 'why' AND t.name = 'Why?'
ON CONFLICT DO NOTHING;

-- Assign books to Konsep Pendidikan tag
INSERT INTO public.book_tags (book_id, tag_id)
SELECT b.id, t.id FROM public.books b, public.tags t 
WHERE b.category = 'konsep-pendidikan' AND t.name = 'Konsep Pendidikan'
ON CONFLICT DO NOTHING;

-- Assign books to Self Motivation tag
INSERT INTO public.book_tags (book_id, tag_id)
SELECT b.id, t.id FROM public.books b, public.tags t 
WHERE b.category = 'self-motivation' AND t.name = 'Self Motivation'
ON CONFLICT DO NOTHING;

-- Assign books to Islamic Book tag
INSERT INTO public.book_tags (book_id, tag_id)
SELECT b.id, t.id FROM public.books b, public.tags t 
WHERE b.category = 'islamic-book' AND t.name = 'Islamic Book'
ON CONFLICT DO NOTHING;

-- Assign books to Islamic History tag
INSERT INTO public.book_tags (book_id, tag_id)
SELECT b.id, t.id FROM public.books b, public.tags t 
WHERE b.category = 'islamic-history' AND t.name = 'Islamic History'
ON CONFLICT DO NOTHING;

-- Assign books to Sejarah tag
INSERT INTO public.book_tags (book_id, tag_id)
SELECT b.id, t.id FROM public.books b, public.tags t 
WHERE b.category = 'sejarah' AND t.name = 'Sejarah'
ON CONFLICT DO NOTHING;

-- Assign books to Buku Belajar Bahasa tag
INSERT INTO public.book_tags (book_id, tag_id)
SELECT b.id, t.id FROM public.books b, public.tags t 
WHERE b.category = 'belajar-bahasa' AND t.name = 'Buku Belajar Bahasa'
ON CONFLICT DO NOTHING;

-- Assign books to Buku Konsep Hidup tag
INSERT INTO public.book_tags (book_id, tag_id)
SELECT b.id, t.id FROM public.books b, public.tags t 
WHERE b.category = 'konsep-hidup' AND t.name = 'Buku Konsep Hidup'
ON CONFLICT DO NOTHING;

-- =============================================
-- DONE! Books have been added and assigned to tags.
-- =============================================
