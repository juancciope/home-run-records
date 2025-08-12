-- Home Run Records Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  role text default 'artist' check (role in ('artist', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Quiz answers table
create table public.quiz_answers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  answers jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Strategy plans table
create table public.strategy_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  plan_text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Artist profiles table
create table public.artist_profiles (
  id uuid references public.users(id) on delete cascade primary key,
  email text not null,
  artist_name text,
  stage_name text,
  genre text,
  bio text,
  profile_image_url text,
  website_url text,
  social_links jsonb default '{}'::jsonb,
  viberate_artist_id text,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies

-- Enable RLS
alter table public.users enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.strategy_plans enable row level security;
alter table public.artist_profiles enable row level security;

-- Users can only see their own data
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Admins can see all users
create policy "Admins can view all users" on public.users
  for select using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Quiz answers policies
create policy "Users can view own quiz answers" on public.quiz_answers
  for select using (auth.uid() = user_id);

create policy "Users can insert own quiz answers" on public.quiz_answers
  for insert with check (auth.uid() = user_id);

create policy "Users can update own quiz answers" on public.quiz_answers
  for update using (auth.uid() = user_id);

create policy "Admins can view all quiz answers" on public.quiz_answers
  for select using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Strategy plans policies
create policy "Users can view own strategy plans" on public.strategy_plans
  for select using (auth.uid() = user_id);

create policy "Users can insert own strategy plans" on public.strategy_plans
  for insert with check (auth.uid() = user_id);

create policy "Users can update own strategy plans" on public.strategy_plans
  for update using (auth.uid() = user_id);

create policy "Admins can view all strategy plans" on public.strategy_plans
  for select using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create user profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_updated_at_users
  before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_quiz_answers
  before update on public.quiz_answers
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_strategy_plans
  before update on public.strategy_plans
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_artist_profiles
  before update on public.artist_profiles
  for each row execute procedure public.handle_updated_at();

-- Artist profiles policies
create policy "Users can view own artist profile" on public.artist_profiles
  for select using (auth.uid() = id);

create policy "Users can insert own artist profile" on public.artist_profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own artist profile" on public.artist_profiles
  for update using (auth.uid() = id);

create policy "Admins can view all artist profiles" on public.artist_profiles
  for select using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );