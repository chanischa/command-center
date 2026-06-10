-- ─────────────────────────────────────────────
-- Command Center — Supabase schema
-- Run this in your Supabase SQL editor
-- ─────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── TASKS ──
create table if not exists public.tasks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  venture     text not null default 'Personal',
  win         text not null default 'evening',   -- commute | lunch | evening
  subtime     text not null default '',
  tags        text[] not null default '{}',
  priority    text not null default 'medium',    -- low | medium | high
  due_date    date,
  notes       text not null default '',
  done        boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── GOALS ──
create table if not exists public.goals (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  venture     text not null default 'Personal',
  horizon     text not null default '6month',   -- 3month | 6month | 1year | 3year
  deadline    date,
  description text not null default '',
  progress    integer not null default 0,
  milestones  jsonb not null default '[]',       -- [{text, done}]
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── USER SETTINGS ──
create table if not exists public.user_settings (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete cascade not null unique,
  calendar_url     text,
  venture_progress jsonb not null default '{}',  -- {Veranin: 60, QuizMe: 80, ...}
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── AUTO-UPDATE updated_at ──
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();

create trigger goals_updated_at
  before update on public.goals
  for each row execute function public.handle_updated_at();

create trigger settings_updated_at
  before update on public.user_settings
  for each row execute function public.handle_updated_at();

-- ── ROW LEVEL SECURITY ──
alter table public.tasks enable row level security;
alter table public.goals enable row level security;
alter table public.user_settings enable row level security;

-- Tasks: users can only see/edit their own
create policy "tasks: own rows" on public.tasks
  for all using (auth.uid() = user_id);

-- Goals: users can only see/edit their own
create policy "goals: own rows" on public.goals
  for all using (auth.uid() = user_id);

-- Settings: users can only see/edit their own
create policy "settings: own rows" on public.user_settings
  for all using (auth.uid() = user_id);

-- ── INDEXES ──
create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_done_idx on public.tasks(done);
create index goals_user_id_idx on public.goals(user_id);
