-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It is safe to run again; existing tables are kept.

create table if not exists public.scholarships (
  id text primary key,
  name text not null,
  provider text not null,
  levels jsonb not null default '[]',
  min_percentage numeric,
  categories jsonb not null default '[]',
  gender text not null default 'any',
  state text not null default 'All India',
  max_income bigint,
  disability_only boolean not null default false,
  required_groups jsonb not null default '[]',
  amount text,
  start_date date,
  last_date date,
  documents jsonb not null default '[]',
  apply_steps jsonb not null default '[]',
  official_link text,
  source_url text,
  criteria_note text,
  status text not null default 'draft' check (status in ('draft', 'published', 'expired')),
  last_verified_on date,
  verification_note text,
  created_at timestamptz not null default now()
);
create index if not exists idx_scholarships_status_last_date on public.scholarships (status, last_date);

-- Students who agreed to save their details. Personal data.
create table if not exists public.student_profiles (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text,
  phone text not null,
  email text,
  school_or_college text not null,
  institution text,
  level text not null,
  stream text,
  course text,
  honours_subject text,
  minor_subject text,
  percentage numeric,
  category text,
  gender text,
  state text,
  income bigint,
  disability boolean,
  groups jsonb
);

-- Date changes found by the daily update. An admin applies or dismisses each one.
create table if not exists public.suggestions (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  scholarship_id text not null,
  field text not null check (field in ('last_date', 'start_date')),
  old_value text,
  new_value text not null,
  source_url text,
  note text,
  status text not null default 'open' check (status in ('open', 'applied', 'dismissed'))
);

-- Lock the tables. With row-level security on and no policies, the public (anon) key can read and
-- write nothing. Only the server, using the secret service key, can reach the data.
alter table public.scholarships enable row level security;
alter table public.student_profiles enable row level security;
alter table public.suggestions enable row level security;
