create table if not exists public.users (
  id uuid primary key,
  email text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  consent_type text not null,
  accepted boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  reason text not null,
  delta integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  provider text not null default 'paddle',
  provider_subscription_id text,
  status text not null default 'inactive',
  monthly_included_remaining integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.reading_archives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  persona text not null,
  mode text not null,
  tier text not null,
  question text not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.safety_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  question text not null,
  outcome text not null,
  reason text not null,
  created_at timestamptz not null default now()
);
