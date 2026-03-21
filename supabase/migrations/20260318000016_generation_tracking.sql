-- ============================================================
-- Migration 016: Generation Tracking
--
-- Tracks the onboarding generation process status
-- ============================================================

create table generation_tracking (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  status          text not null default 'pending',  -- pending, generating_skills, generating_quests, completed, failed
  progress        int not null default 0,            -- 0-100
  current_step    text,                              -- current step description
  error_message   text,                              -- error details if failed
  skills_done     boolean not null default false,
  quests_done     boolean not null default false,
  skills_count    int not null default 0,            -- number of skills generated
  quests_count    int not null default 0,            -- number of quests generated
  started_at      timestamptz not null default now(),
  completed_at    timestamptz,
  updated_at      timestamptz not null default now(),
  unique (user_id)
);

create index generation_tracking_user on generation_tracking (user_id);
create index generation_tracking_status on generation_tracking (status);

-- RLS
alter table generation_tracking enable row level security;

create policy "Users can view own generation tracking"
  on generation_tracking for select
  using (auth.uid() = user_id);

create policy "Service role can manage generation tracking"
  on generation_tracking for all
  using (true)
  with check (true);

-- Trigger
create trigger generation_tracking_updated_at
  before update on generation_tracking
  for each row execute procedure set_updated_at();

-- Add status enum for skill_nodes
do $$ begin
  create type generation_status as enum ('pending', 'generating', 'completed', 'failed');
exception
  when duplicate_object then null;
end $$;
