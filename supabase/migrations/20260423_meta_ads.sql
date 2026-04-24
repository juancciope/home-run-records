-- Meta Ads (Marketing API) integration
-- Agency-scoped connections + insights cache.

create table if not exists public.meta_ad_connections (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  meta_user_id text not null,
  meta_user_name text,
  access_token_encrypted text not null,
  token_expires_at timestamptz not null,
  selected_ad_account_id text,
  connected_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agency_id)
);

create table if not exists public.meta_insights_cache (
  agency_id uuid not null references public.agencies(id) on delete cascade,
  meta_ad_account_id text not null,
  date_preset text not null,
  payload jsonb not null,
  fetched_at timestamptz not null default now(),
  primary key (agency_id, meta_ad_account_id, date_preset)
);

create index if not exists idx_meta_ad_connections_agency on public.meta_ad_connections(agency_id);
create index if not exists idx_meta_insights_cache_fetched on public.meta_insights_cache(fetched_at);

alter table public.meta_ad_connections enable row level security;
alter table public.meta_insights_cache enable row level security;

drop policy if exists "agency members read connection" on public.meta_ad_connections;
create policy "agency members read connection" on public.meta_ad_connections
  for select using (
    exists (
      select 1 from public.agency_users au
      where au.agency_id = meta_ad_connections.agency_id
        and au.user_id = auth.uid()
    )
  );

drop policy if exists "agency members read cache" on public.meta_insights_cache;
create policy "agency members read cache" on public.meta_insights_cache
  for select using (
    exists (
      select 1 from public.agency_users au
      where au.agency_id = meta_insights_cache.agency_id
        and au.user_id = auth.uid()
    )
  );

-- Writes happen from server routes using the service role, which bypasses RLS.
