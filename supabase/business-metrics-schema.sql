-- Business Metrics Schema Extension for Home Run Records
-- Adds support for the 4 key business realms

-- 1. Production Pipeline Tracking
create table if not exists public.production_pipeline (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  project_name text not null,
  project_type text check (project_type in ('single', 'ep', 'album', 'mixtape')),
  status text not null check (status in ('unfinished', 'finished', 'released')),
  created_date timestamp with time zone default timezone('utc'::text, now()),
  finished_date timestamp with time zone,
  release_date timestamp with time zone,
  metadata jsonb default '{}', -- track info, collaborators, etc
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Marketing Funnel Metrics
create table if not exists public.marketing_metrics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  metric_date date not null,
  total_reach integer default 0,
  engaged_audience integer default 0,
  total_followers integer default 0,
  youtube_subscribers integer default 0,
  platform_breakdown jsonb default '{}', -- {spotify: 1000, instagram: 2000, etc}
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, metric_date)
);

-- 3. Fan Engagement Pipeline
create table if not exists public.fan_engagement (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  fan_email text,
  fan_name text,
  engagement_level text check (engagement_level in ('captured_data', 'fan', 'super_fan')),
  first_contact_date timestamp with time zone default timezone('utc'::text, now()),
  last_interaction timestamp with time zone,
  lifetime_value numeric default 0,
  interactions_count integer default 0,
  metadata jsonb default '{}', -- purchase history, event attendance, etc
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, fan_email)
);

-- 4. Conversion Funnel
create table if not exists public.conversion_funnel (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  lead_source text, -- social, website, event, referral
  status text check (status in ('lead', 'opportunity', 'sale', 'lost')),
  product_type text, -- merch, ticket, music, vip
  value numeric,
  contact_info jsonb default '{}',
  notes text,
  created_date timestamp with time zone default timezone('utc'::text, now()),
  opportunity_date timestamp with time zone,
  close_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_production_pipeline_user_status on public.production_pipeline(user_id, status);
create index if not exists idx_marketing_metrics_user_date on public.marketing_metrics(user_id, metric_date desc);
create index if not exists idx_fan_engagement_user_level on public.fan_engagement(user_id, engagement_level);
create index if not exists idx_conversion_funnel_user_status on public.conversion_funnel(user_id, status);

-- RLS Policies
alter table public.production_pipeline enable row level security;
alter table public.marketing_metrics enable row level security;
alter table public.fan_engagement enable row level security;
alter table public.conversion_funnel enable row level security;

-- Production Pipeline policies
create policy "Users can manage own production pipeline" on public.production_pipeline
  for all using (auth.uid() = user_id);

-- Marketing Metrics policies  
create policy "Users can manage own marketing metrics" on public.marketing_metrics
  for all using (auth.uid() = user_id);

-- Fan Engagement policies
create policy "Users can manage own fan engagement" on public.fan_engagement
  for all using (auth.uid() = user_id);

-- Conversion Funnel policies
create policy "Users can manage own conversion funnel" on public.conversion_funnel
  for all using (auth.uid() = user_id);

-- Helper function to get pipeline metrics
create or replace function public.get_pipeline_metrics(artist_id uuid)
returns jsonb as $$
declare
  metrics jsonb;
begin
  select jsonb_build_object(
    'production', (
      select jsonb_build_object(
        'unfinished', count(*) filter (where status = 'unfinished'),
        'finished', count(*) filter (where status = 'finished'),
        'released', count(*) filter (where status = 'released')
      )
      from public.production_pipeline
      where user_id = artist_id
    ),
    'marketing', (
      select jsonb_build_object(
        'total_reach', coalesce(max(total_reach), 0),
        'engaged_audience', coalesce(max(engaged_audience), 0),
        'total_followers', coalesce(max(total_followers), 0),
        'youtube_subscribers', coalesce(max(youtube_subscribers), 0)
      )
      from public.marketing_metrics
      where user_id = artist_id
      order by metric_date desc
      limit 1
    ),
    'fan_engagement', (
      select jsonb_build_object(
        'captured_data', count(*) filter (where engagement_level = 'captured_data'),
        'fans', count(*) filter (where engagement_level = 'fan'),
        'super_fans', count(*) filter (where engagement_level = 'super_fan')
      )
      from public.fan_engagement
      where user_id = artist_id
    ),
    'conversion', (
      select jsonb_build_object(
        'leads', count(*) filter (where status = 'lead'),
        'opportunities', count(*) filter (where status = 'opportunity'),
        'sales', count(*) filter (where status = 'sale'),
        'revenue', coalesce(sum(value) filter (where status = 'sale'), 0)
      )
      from public.conversion_funnel
      where user_id = artist_id
      and created_date >= current_date - interval '30 days'
    )
  ) into metrics;
  
  return metrics;
end;
$$ language plpgsql security definer;

-- Updated_at triggers
create trigger handle_updated_at_production_pipeline
  before update on public.production_pipeline
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_fan_engagement
  before update on public.fan_engagement
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_conversion_funnel
  before update on public.conversion_funnel
  for each row execute procedure public.handle_updated_at();