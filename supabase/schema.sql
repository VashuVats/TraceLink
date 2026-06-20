-- TraceLink schema
-- Run this in the Supabase SQL editor (or `supabase db push`) once per project.

create extension if not exists "pgcrypto";

-- ── missing_persons ─────────────────────────────────────────────
create table if not exists missing_persons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age int,
  gender text,
  photo_url text,
  description text,
  last_seen_location text,
  last_seen_lat double precision,
  last_seen_lng double precision,
  last_seen_date date,
  status text not null default 'active' check (status in ('active', 'resolved')),
  created_at timestamptz not null default now()
);

-- ── leads ────────────────────────────────────────────────────────
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references missing_persons(id) on delete cascade,
  source text not null,
  source_type text not null default 'news' check (source_type in ('news', 'social', 'citizen_tip')),
  source_url text,
  content text not null,
  location text,
  lat double precision,
  lng double precision,
  confidence int not null default 0 check (confidence between 0 and 100),
  image_url text,
  created_at timestamptz not null default now()
);
create index if not exists leads_person_id_idx on leads(person_id);

-- ── citizen_tips ─────────────────────────────────────────────────
create table if not exists citizen_tips (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references missing_persons(id) on delete cascade,
  tip_text text not null,
  location text,
  lat double precision,
  lng double precision,
  contact_info text,
  status text not null default 'new' check (status in ('new', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);
create index if not exists citizen_tips_person_id_idx on citizen_tips(person_id);

-- ── Row Level Security ───────────────────────────────────────────
-- Hackathon-simple policy: open read/write for any client using the anon
-- key. There is no auth in this build (by design, to save time). Before
-- using this beyond a demo, add real auth and lock these down per-role.
alter table missing_persons enable row level security;
alter table leads enable row level security;
alter table citizen_tips enable row level security;

create policy "public read missing_persons" on missing_persons for select using (true);
create policy "public write missing_persons" on missing_persons for insert with check (true);
create policy "public update missing_persons" on missing_persons for update using (true);

create policy "public read leads" on leads for select using (true);
create policy "public write leads" on leads for insert with check (true);

create policy "public read citizen_tips" on citizen_tips for select using (true);
create policy "public write citizen_tips" on citizen_tips for insert with check (true);

-- ── Optional: one seed case so the dashboard isn't empty on first run ──
insert into missing_persons (name, age, gender, description, last_seen_location, last_seen_lat, last_seen_lng, last_seen_date, status)
values (
  'Avery Morgan',
  29,
  'Female',
  '5''6", slim build, shoulder-length brown hair, last seen wearing a navy jacket and grey backpack. Known to frequent the riverside running trail in the early morning.',
  'Riverside Park, Columbus, OH',
  39.9690,
  -83.0090,
  current_date - interval '3 days',
  'active'
)
on conflict do nothing;
