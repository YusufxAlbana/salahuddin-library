-- =============================================
-- SAMPLE USERS DATA
-- Run this in Supabase SQL Editor
-- Note: These are sample users for testing purposes
-- =============================================

-- First, insert into auth.users (requires service_role or database admin access)
-- This creates the auth records that public.users references

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '00000000-0000-0000-0000-000000000000', 'ahmad.ridwan@gmail.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Ahmad Ridwan"}', 'authenticated', 'authenticated'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', '00000000-0000-0000-0000-000000000000', 'siti.nurhaliza@gmail.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Siti Nurhaliza"}', 'authenticated', 'authenticated'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', '00000000-0000-0000-0000-000000000000', 'budi.santoso@gmail.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Budi Santoso"}', 'authenticated', 'authenticated'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', '00000000-0000-0000-0000-000000000000', 'dewi.lestari@gmail.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Dewi Lestari"}', 'authenticated', 'authenticated'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', '00000000-0000-0000-0000-000000000000', 'reza.pratama@gmail.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Reza Pratama"}', 'authenticated', 'authenticated'),
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', '00000000-0000-0000-0000-000000000000', 'maya.sari@gmail.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Maya Sari"}', 'authenticated', 'authenticated'),
  ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', '00000000-0000-0000-0000-000000000000', 'fajar.nugroho@gmail.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Fajar Nugroho"}', 'authenticated', 'authenticated'),
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', '00000000-0000-0000-0000-000000000000', 'putri.amanda@gmail.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Putri Amanda"}', 'authenticated', 'authenticated'),
  ('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', '00000000-0000-0000-0000-000000000000', 'hendra.wijaya@gmail.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Hendra Wijaya"}', 'authenticated', 'authenticated'),
  ('d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4a', '00000000-0000-0000-0000-000000000000', 'rina.susanti@gmail.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Rina Susanti"}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Also insert into auth.identities (required for email login)
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'ahmad.ridwan@gmail.com', '{"sub":"a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d","email":"ahmad.ridwan@gmail.com"}', 'email', NOW(), NOW(), NOW()),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'siti.nurhaliza@gmail.com', '{"sub":"b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e","email":"siti.nurhaliza@gmail.com"}', 'email', NOW(), NOW(), NOW()),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'budi.santoso@gmail.com', '{"sub":"c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f","email":"budi.santoso@gmail.com"}', 'email', NOW(), NOW(), NOW()),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'dewi.lestari@gmail.com', '{"sub":"d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a","email":"dewi.lestari@gmail.com"}', 'email', NOW(), NOW(), NOW()),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'reza.pratama@gmail.com', '{"sub":"e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b","email":"reza.pratama@gmail.com"}', 'email', NOW(), NOW(), NOW()),
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'maya.sari@gmail.com', '{"sub":"f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c","email":"maya.sari@gmail.com"}', 'email', NOW(), NOW(), NOW()),
  ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 'fajar.nugroho@gmail.com', '{"sub":"a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d","email":"fajar.nugroho@gmail.com"}', 'email', NOW(), NOW(), NOW()),
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 'putri.amanda@gmail.com', '{"sub":"b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e","email":"putri.amanda@gmail.com"}', 'email', NOW(), NOW(), NOW()),
  ('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 'hendra.wijaya@gmail.com', '{"sub":"c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f","email":"hendra.wijaya@gmail.com"}', 'email', NOW(), NOW(), NOW()),
  ('d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4a', 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4a', 'rina.susanti@gmail.com', '{"sub":"d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4a","email":"rina.susanti@gmail.com"}', 'email', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Now insert into public.users (non-member status, need to register KTP)
INSERT INTO public.users (id, email, name, role, avatar_url, join_date, donated_books, member_status, ktp_url, payment_status) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'ahmad.ridwan@gmail.com', 'Ahmad Ridwan', 'user', NULL, NOW() - INTERVAL '30 days', 0, 'non-member', NULL, 'unpaid'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'siti.nurhaliza@gmail.com', 'Siti Nurhaliza', 'user', NULL, NOW() - INTERVAL '25 days', 0, 'non-member', NULL, 'unpaid'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'budi.santoso@gmail.com', 'Budi Santoso', 'user', NULL, NOW() - INTERVAL '20 days', 0, 'non-member', NULL, 'unpaid'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'dewi.lestari@gmail.com', 'Dewi Lestari', 'user', NULL, NOW() - INTERVAL '18 days', 0, 'non-member', NULL, 'unpaid'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'reza.pratama@gmail.com', 'Reza Pratama', 'user', NULL, NOW() - INTERVAL '15 days', 0, 'non-member', NULL, 'unpaid'),
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'maya.sari@gmail.com', 'Maya Sari', 'user', NULL, NOW() - INTERVAL '12 days', 0, 'non-member', NULL, 'unpaid'),
  ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 'fajar.nugroho@gmail.com', 'Fajar Nugroho', 'user', NULL, NOW() - INTERVAL '10 days', 0, 'non-member', NULL, 'unpaid'),
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 'putri.amanda@gmail.com', 'Putri Amanda', 'user', NULL, NOW() - INTERVAL '7 days', 0, 'non-member', NULL, 'unpaid'),
  ('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 'hendra.wijaya@gmail.com', 'Hendra Wijaya', 'user', NULL, NOW() - INTERVAL '5 days', 0, 'non-member', NULL, 'unpaid'),
  ('d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4a', 'rina.susanti@gmail.com', 'Rina Susanti', 'user', NULL, NOW() - INTERVAL '2 days', 0, 'non-member', NULL, 'unpaid')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- DONE! All 10 users created with password: password123
-- They can login and will need to upload KTP to become members
-- =============================================
