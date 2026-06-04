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
  bracket_winners jsonb not null,
  champion text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, period_id, prediction_number)
);

alter table public.profiles enable row level security;
alter table public.prediction_periods enable row level security;
alter table public.predictions enable row level security;

create policy "profiles are public readable"
on public.profiles for select
using (true);

create policy "users can insert own profile"
on public.profiles for insert
with check (id = auth.uid());

create policy "users can update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

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
