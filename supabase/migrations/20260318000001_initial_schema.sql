-- ============================================================
-- Migration 001: Initial Schema
-- Run: supabase db push  OR  paste into Supabase SQL editor
-- ============================================================

-- gen_random_uuid() is built-in from PostgreSQL 13+ (no extension needed on Supabase)

-- ─── ENUMS ────────────────────────────────────────────────────────────────────
create type branch_type    as enum ('career', 'finance', 'softskills', 'wellbeing');
create type node_status    as enum ('locked', 'in_progress', 'completed', 'todo');
create type difficulty_type as enum ('easy', 'medium', 'hard');
create type time_horizon   as enum ('short', 'mid', 'long');
create type notif_type     as enum ('streak_reminder', 'quest_suggestion', 'level_up', 'challenge_complete', 'wellbeing_warning');

-- ─── profiles ─────────────────────────────────────────────────────────────────
-- Extends auth.users 1-to-1. Created automatically via trigger on signup.
create table profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  name                  text not null default 'Người Dùng',
  avatar_url            text,
  level                 int  not null default 1,
  total_xp              int  not null default 0,
  current_xp_in_level   int  not null default 0,
  xp_to_next_level      int  not null default 100,
  streak                int  not null default 0,
  best_streak           int  not null default 0,
  stamina               int  not null default 100 check (stamina between 0 and 100),
  primary_branch        branch_type,
  onboarding_done       boolean not null default false,
  last_active_date      date,
  shields_remaining     int  not null default 2 check (shields_remaining between 0 and 2),
  shield_activated_date date,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ─── skill_nodes (master catalog) ─────────────────────────────────────────────
create table skill_nodes (
  node_id     text primary key,           -- e.g. 'career_t1_1'
  branch      branch_type not null,
  tier        int not null check (tier between 1 and 3),
  title       text not null,
  description text not null default '',
  xp_required int not null default 50,
  quests_total int not null default 5,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ─── user_skill_nodes ─────────────────────────────────────────────────────────
create table user_skill_nodes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  node_id         text not null references skill_nodes(node_id) on delete cascade,
  status          node_status not null default 'locked',
  quests_completed int not null default 0,
  unlocked_at     timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  unique (user_id, node_id)
);

-- ─── quests (master catalog) ──────────────────────────────────────────────────
create table quests (
  quest_id     text primary key,           -- e.g. 'career_easy_001'
  title        text not null,
  description  text not null default '',
  branch       branch_type not null,
  difficulty   difficulty_type not null,
  duration_min int not null check (duration_min in (5, 15, 30)),
  xp_reward    int not null check (xp_reward in (10, 25, 50)),
  node_id      text references skill_nodes(node_id),
  created_at   timestamptz not null default now()
);

-- ─── user_quests ──────────────────────────────────────────────────────────────
create table user_quests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  quest_id     text not null references quests(quest_id),
  completed_at timestamptz default now(),
  xp_earned    int not null,
  date         date not null default current_date
);
create index user_quests_user_date on user_quests (user_id, date);

-- ─── challenges (master catalog) ──────────────────────────────────────────────
create table challenges (
  id            text primary key,
  title         text not null,
  description   text not null default '',
  branch        branch_type not null,
  target_count  int not null,
  duration_days int not null,
  created_at    timestamptz not null default now()
);

-- ─── user_challenges ──────────────────────────────────────────────────────────
create table user_challenges (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  challenge_id text not null references challenges(id),
  progress     int not null default 0,
  joined_at    timestamptz not null default now(),
  ends_at      timestamptz not null,
  completed_at timestamptz,
  unique (user_id, challenge_id)
);

-- ─── roadmap_milestones ───────────────────────────────────────────────────────
create table roadmap_milestones (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  branch       branch_type not null,
  horizon      time_horizon not null,
  target_date  date not null,
  is_completed boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── custom_goal_trees ────────────────────────────────────────────────────────
create table custom_goal_trees (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  goal       text not null,
  clusters   jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── notifications ────────────────────────────────────────────────────────────
create table notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       notif_type not null,
  title      text not null,
  body       text not null default '',
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_unread on notifications (user_id, is_read);

-- ─── TRIGGERS ─────────────────────────────────────────────────────────────────

-- Auto-create profile row when user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Auto-update updated_at columns
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure set_updated_at();

create trigger roadmap_milestones_updated_at
  before update on roadmap_milestones
  for each row execute procedure set_updated_at();

create trigger custom_goal_trees_updated_at
  before update on custom_goal_trees
  for each row execute procedure set_updated_at();
