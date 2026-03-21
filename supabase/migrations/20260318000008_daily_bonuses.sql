-- ============================================================
-- Migration 008: Daily Bonuses
-- Tracks daily login rewards per user
-- Run: supabase db push  OR  paste into Supabase SQL editor
-- ============================================================

-- ─── daily_bonuses ─────────────────────────────────────────────────────────────
create table daily_bonuses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  bonus_date  date not null default current_date,
  xp_earned   int not null,
  streak_day  int not null default 1,
  created_at  timestamptz not null default now(),
  unique (user_id, bonus_date)
);

create index daily_bonuses_user_date on daily_bonuses (user_id, bonus_date);

-- ─── RLS ───────────────────────────────────────────────────────────────────────
alter table daily_bonuses enable row level security;

create policy "Users can read own daily bonuses"
  on daily_bonuses for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily bonuses"
  on daily_bonuses for insert
  with check (auth.uid() = user_id);
