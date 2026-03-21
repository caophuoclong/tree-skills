-- ============================================================
-- Migration 017: Prompt Execution Tracking
--
-- Tracks all AI prompts executed by edge functions
-- ============================================================

create table prompt_executions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade,
  prompt_name     text not null,                    -- e.g. 'skill_generation', 'quest_generation'
  prompt_version  int not null default 1,
  edge_function   text not null,                    -- which edge function executed it
  variables       jsonb not null default '{}',      -- variables used to fill template
  filled_prompt   text not null,                    -- the actual prompt sent to AI
  ai_response     text,                             -- raw AI response
  parsed_data     jsonb,                            -- parsed response data
  model           text,                             -- AI model used
  provider        text,                             -- AI provider used
  tokens_used     int,                              -- tokens consumed
  success         boolean not null default true,
  error_message   text,
  duration_ms     int,                              -- execution time in milliseconds
  executed_at     timestamptz not null default now()
);

create index prompt_executions_user on prompt_executions (user_id);
create index prompt_executions_name on prompt_executions (prompt_name);
create index prompt_executions_executed on prompt_executions (executed_at);

-- RLS
alter table prompt_executions enable row level security;

create policy "Service role can manage prompt executions"
  on prompt_executions for all
  using (true)
  with check (true);

create policy "Users can view own prompt executions"
  on prompt_executions for select
  using (auth.uid() = user_id);
