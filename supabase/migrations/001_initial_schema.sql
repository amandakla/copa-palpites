create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.prediction_periods (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  period_id uuid not null references public.prediction_periods(id) on delete cascade,
  prediction_number integer not null,
  name text not null,
  picks jsonb not null,
  third_place_order jsonb not null default '[]'::jsonb,
  bracket_winners jsonb not null,
  champion text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, period_id, prediction_number),
  constraint one_prediction_per_user_period unique (user_id, period_id)
);

alter table public.predictions
drop constraint if exists one_prediction_per_user_period;

alter table public.predictions
add constraint one_prediction_per_user_period unique (user_id, period_id);

create table if not exists public.official_results (
  id text primary key default 'current' check (id = 'current'),
  picks jsonb not null default '[]'::jsonb,
  third_place_order jsonb not null default '[]'::jsonb,
  bracket_winners jsonb not null default '{}'::jsonb,
  champion text,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

alter table public.predictions
add column if not exists third_place_order jsonb not null default '[]'::jsonb;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_username text;
begin
  requested_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', ''), '[^a-z0-9._]', '', 'g'));

  if char_length(requested_username) < 3 then
    raise exception 'username must have at least 3 characters';
  end if;

  insert into public.profiles (id, username, role)
  values (new.id, requested_username, 'user');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.get_email_by_username(requested_username text)
returns text
language sql
security definer
set search_path = public, auth
as $$
  select auth.users.email
  from public.profiles
  join auth.users on auth.users.id = profiles.id
  where profiles.username = lower(regexp_replace(requested_username, '[^a-z0-9._]', '', 'g'))
  limit 1;
$$;

alter table public.profiles enable row level security;
alter table public.prediction_periods enable row level security;
alter table public.predictions enable row level security;
alter table public.official_results enable row level security;

drop policy if exists "profiles are public readable" on public.profiles;
drop policy if exists "users can insert own profile" on public.profiles;
drop policy if exists "users can update own profile" on public.profiles;
drop policy if exists "periods are public readable" on public.prediction_periods;
drop policy if exists "admins can manage periods" on public.prediction_periods;
drop policy if exists "predictions are public readable" on public.predictions;
drop policy if exists "users can insert own predictions in open periods" on public.predictions;
drop policy if exists "users can update own predictions in open periods" on public.predictions;
drop policy if exists "users can delete own predictions in open periods" on public.predictions;
drop policy if exists "official results are public readable" on public.official_results;
drop policy if exists "admins can manage official results" on public.official_results;

create policy "profiles are public readable"
on public.profiles for select
using (true);

create policy "users can insert own profile"
on public.profiles for insert
with check (id = auth.uid() and role = 'user');

create policy "periods are public readable"
on public.prediction_periods for select
using (true);

create policy "admins can manage periods"
on public.prediction_periods for all
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "predictions are public readable"
on public.predictions for select
using (true);

create policy "users can insert own predictions in open periods"
on public.predictions for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.prediction_periods
    where prediction_periods.id = period_id
      and now() between prediction_periods.starts_at and prediction_periods.ends_at
  )
);

create policy "users can update own predictions in open periods"
on public.predictions for update
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.prediction_periods
    where prediction_periods.id = period_id
      and now() between prediction_periods.starts_at and prediction_periods.ends_at
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.prediction_periods
    where prediction_periods.id = period_id
      and now() between prediction_periods.starts_at and prediction_periods.ends_at
  )
);

create policy "users can delete own predictions in open periods"
on public.predictions for delete
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.prediction_periods
    where prediction_periods.id = period_id
      and now() between prediction_periods.starts_at and prediction_periods.ends_at
  )
);

create policy "official results are public readable"
on public.official_results for select
using (true);

create policy "admins can manage official results"
on public.official_results for all
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);
