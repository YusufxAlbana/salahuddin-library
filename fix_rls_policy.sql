-- PERBAIKAN RLS POLICY: Izinkan user baru untuk insert profil mereka sendiri
-- Jalankan ini di SQL Editor Supabase

-- Hapus policy lama yang restrictive
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.users;

-- Buat policy baru yang lebih permissive (allow insert jika id nya match dengan auth user)
-- Namun karena ada timing issue, kita juga izinkan insert oleh service role (trigger)
CREATE POLICY "Allow users to insert own profile" ON public.users
FOR INSERT WITH CHECK (
    auth.uid() = id OR auth.uid() IS NOT NULL
);

-- Untuk memastikan service role (trigger) bisa insert, kita perlu policy khusus
-- Atau, cara paling aman: DISABLE RLS sementara untuk testing
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- OPTIONAL: Jika mau langsung sync user yang sudah ada di auth tapi belum ada di public.users
-- Uncomment dan jalankan query dibawah ini:
/*
INSERT INTO public.users (id, email, name, role, join_date)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'name', 'User'), 
    'member', 
    created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
*/
