-- Enhanced Home Run Records Database Schema for Production
-- Designed for scalability with multiple artists

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  role text default 'artist' check (role in ('artist', 'admin', 'manager')),
  artist_name text,
  stage_name text,
  genre text,
  bio text,
  profile_image_url text,
  website_url text,
  social_links jsonb default '{}', -- {instagram: '', twitter: '', spotify: '', etc}
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'enterprise')),
  subscription_expires_at timestamp with time zone,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Artist metrics table for tracking performance data
create table public.artist_metrics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  metric_type text not null check (metric_type in ('streams', 'followers', 'engagement', 'reach', 'revenue')),
  platform text, -- spotify, apple_music, instagram, etc
  value numeric not null,
  date date not null,
  metadata jsonb default '{}', -- additional context
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure unique metric per user/type/platform/date
  unique(user_id, metric_type, platform, date)
);

-- Releases table for tracking music releases
create table public.releases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  artist_name text not null,
  release_type text check (release_type in ('single', 'ep', 'album', 'compilation')),
  release_date date,
  cover_image_url text,
  platforms jsonb default '{}', -- {spotify: 'url', apple_music: 'url', etc}
  status text default 'draft' check (status in ('draft', 'scheduled', 'released', 'archived')),
  metadata jsonb default '{}', -- genre, duration, etc
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Connected accounts for platform integrations
create table public.connected_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  platform text not null, -- spotify, instagram, twitter, etc
  platform_user_id text not null,
  access_token text, -- encrypted
  refresh_token text, -- encrypted
  expires_at timestamp with time zone,
  scopes text[], -- array of permissions
  is_active boolean default true,
  last_sync_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure unique platform per user
  unique(user_id, platform)
);

-- Goals and objectives tracking
create table public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text,
  goal_type text check (goal_type in ('streams', 'followers', 'revenue', 'releases', 'custom')),
  target_value numeric,
  current_value numeric default 0,
  target_date date,
  status text default 'active' check (status in ('active', 'completed', 'paused', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Campaign tracking for marketing efforts
create table public.campaigns (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  description text,
  campaign_type text check (campaign_type in ('release', 'social', 'playlist', 'advertising', 'pr')),
  start_date date,
  end_date date,
  budget numeric,
  platforms text[], -- array of platforms
  status text default 'draft' check (status in ('draft', 'active', 'paused', 'completed', 'cancelled')),
  results jsonb default '{}', -- campaign performance data
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Keep existing quiz and strategy tables but enhance them
alter table public.quiz_answers 
add column if not exists quiz_version text default '1.0',
add column if not exists score numeric,
add column if not exists recommendations jsonb default '{}';

alter table public.strategy_plans
add column if not exists plan_version text default '1.0',
add column if not exists implemented_actions jsonb default '[]',
add column if not exists progress_score numeric default 0;

-- Indexes for performance
create index idx_artist_metrics_user_date on public.artist_metrics(user_id, date desc);
create index idx_artist_metrics_type_platform on public.artist_metrics(metric_type, platform);
create index idx_releases_user_status on public.releases(user_id, status);
create index idx_releases_date on public.releases(release_date desc);
create index idx_connected_accounts_user on public.connected_accounts(user_id, is_active);
create index idx_goals_user_status on public.goals(user_id, status);
create index idx_campaigns_user_dates on public.campaigns(user_id, start_date, end_date);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.artist_metrics enable row level security;
alter table public.releases enable row level security;
alter table public.connected_accounts enable row level security;
alter table public.goals enable row level security;
alter table public.campaigns enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.strategy_plans enable row level security;

-- Users policies
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Admins can view all users" on public.users
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Artist metrics policies
create policy "Users can manage own metrics" on public.artist_metrics
  for all using (auth.uid() = user_id);

create policy "Admins can view all metrics" on public.artist_metrics
  for select using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Releases policies
create policy "Users can manage own releases" on public.releases
  for all using (auth.uid() = user_id);

-- Connected accounts policies (sensitive data)
create policy "Users can manage own connected accounts" on public.connected_accounts
  for all using (auth.uid() = user_id);

-- Goals policies
create policy "Users can manage own goals" on public.goals
  for all using (auth.uid() = user_id);

-- Campaigns policies
create policy "Users can manage own campaigns" on public.campaigns
  for all using (auth.uid() = user_id);

-- Quiz answers policies
create policy "Users can manage own quiz answers" on public.quiz_answers
  for all using (auth.uid() = user_id);

-- Strategy plans policies
create policy "Users can manage own strategy plans" on public.strategy_plans
  for all using (auth.uid() = user_id);

-- Functions for business logic

-- Function to calculate artist score based on metrics
create or replace function public.calculate_artist_score(artist_id uuid)
returns numeric as $$
declare
  score numeric := 0;
  streams_score numeric := 0;
  followers_score numeric := 0;
  engagement_score numeric := 0;
begin
  -- Calculate streams score (last 30 days)
  select coalesce(sum(value), 0) * 0.001 into streams_score
  from public.artist_metrics
  where user_id = artist_id 
    and metric_type = 'streams'
    and date >= current_date - interval '30 days';
  
  -- Calculate followers score (latest total)
  select coalesce(max(value), 0) * 0.01 into followers_score
  from public.artist_metrics
  where user_id = artist_id 
    and metric_type = 'followers';
  
  -- Calculate engagement score (last 7 days average)
  select coalesce(avg(value), 0) * 0.1 into engagement_score
  from public.artist_metrics
  where user_id = artist_id 
    and metric_type = 'engagement'
    and date >= current_date - interval '7 days';
  
  score := streams_score + followers_score + engagement_score;
  return round(score, 2);
end;
$$ language plpgsql security definer;

-- Function to get artist dashboard summary
create or replace function public.get_dashboard_summary(artist_id uuid)
returns jsonb as $$
declare
  summary jsonb;
begin
  with metrics_summary as (
    select 
      metric_type,
      sum(case when date >= current_date - interval '30 days' then value else 0 end) as last_30_days,
      sum(case when date >= current_date - interval '60 days' and date < current_date - interval '30 days' then value else 0 end) as previous_30_days
    from public.artist_metrics
    where user_id = artist_id
    group by metric_type
  ),
  recent_releases as (
    select count(*) as total_releases,
           count(case when release_date >= current_date - interval '90 days' then 1 end) as recent_releases
    from public.releases
    where user_id = artist_id and status = 'released'
  ),
  active_goals as (
    select count(*) as total_goals,
           count(case when status = 'completed' then 1 end) as completed_goals
    from public.goals
    where user_id = artist_id
  )
  select jsonb_build_object(
    'artist_score', public.calculate_artist_score(artist_id),
    'metrics', (select jsonb_object_agg(metric_type, jsonb_build_object(
      'current', last_30_days,
      'previous', previous_30_days,
      'change_percent', case 
        when previous_30_days > 0 then round(((last_30_days - previous_30_days) / previous_30_days * 100), 2)
        else null
      end
    )) from metrics_summary),
    'releases', (select to_jsonb(recent_releases.*) from recent_releases),
    'goals', (select to_jsonb(active_goals.*) from active_goals),
    'updated_at', timezone('utc'::text, now())
  ) into summary;
  
  return summary;
end;
$$ language plpgsql security definer;

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Triggers
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

-- Updated_at triggers for all tables
create trigger handle_updated_at_users
  before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_releases
  before update on public.releases
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_connected_accounts
  before update on public.connected_accounts
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_goals
  before update on public.goals
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_campaigns
  before update on public.campaigns
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_quiz_answers
  before update on public.quiz_answers
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_strategy_plans
  before update on public.strategy_plans
  for each row execute procedure public.handle_updated_at();