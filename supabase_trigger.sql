-- Create a function that handles new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, role, avatar_url, join_date, donated_books, programs_joined)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    'member',
    new.raw_user_meta_data->>'avatar_url',
    now(),
    0,
    '{}'
  );
  return new;
end;
$$;

-- Create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Optional: Fix existing users who missed the profile creation (Run manually if needed)
-- insert into public.users (id, email, name, role, join_date)
-- select id, email, raw_user_meta_data->>'name', 'member', created_at
-- from auth.users
-- where id not in (select id from public.users);
