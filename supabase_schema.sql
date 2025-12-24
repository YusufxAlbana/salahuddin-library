-- Create Users Table (extends Supabase Auth)
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  role text default 'member',
  avatar_url text,
  join_date timestamp with time zone default timezone('utc'::text, now()),
  donated_books int default 0,
  programs_joined text[] default '{}'::text[]
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- Create Policies
create policy "Public profiles are viewable by everyone." on public.users for select using ( true );
create policy "Users can insert their own profile." on public.users for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on public.users for update using ( auth.uid() = id );

-- Create Programs Table
create table public.programs (
  id text primary key,
  title text not null,
  icon text,
  short_desc text,
  full_desc text,
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.programs enable row level security;
create policy "Programs are viewable by everyone." on public.programs for select using ( true );
create policy "Only admins can insert programs." on public.programs for insert with check ( 
  exists (select 1 from public.users where id = auth.uid() and role = 'admin') 
);
create policy "Only admins can update programs." on public.programs for update using ( 
  exists (select 1 from public.users where id = auth.uid() and role = 'admin') 
);

-- Note: 'books' table is assumed to be handled by previous implementation or auto-created
