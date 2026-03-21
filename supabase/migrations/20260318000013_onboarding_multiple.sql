-- ============================================================
-- Migration 013: Onboarding Multiple Selections
--
-- Adds support for multiple selections on onboarding steps.
-- Updates master_data with `multiple` flag and changes
-- user_onboardings to store arrays for multi-select steps.
-- ============================================================

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 1: Add multiple flag to master_data
-- ═══════════════════════════════════════════════════════════════════════════════

alter table master_data add column if not exists multiple boolean not null default false;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2: Create onboarding_steps config table
-- ═══════════════════════════════════════════════════════════════════════════════

create table onboarding_steps (
  id            serial primary key,
  step_key      text not null unique,             -- e.g. 'career_stage', 'pain_point'
  master_type   text,                             -- links to master_data.type (null for custom steps like stamina)
  title         text not null,
  subtitle      text not null,
  multiple      boolean not null default false,   -- allow multiple selections
  required      boolean not null default true,    -- is this step required
  sort_order    int not null default 0
);

alter table onboarding_steps enable row level security;

create policy "Anyone can read onboarding steps"
  on onboarding_steps for select using (true);

create policy "No public write onboarding steps"
  on onboarding_steps for all using (false);

-- Seed steps
insert into onboarding_steps (step_key, master_type, title, subtitle, multiple, required, sort_order) values
  ('career_stage',   'career_stage',   'Bạn đang ở đâu trong sự nghiệp?', 'Chọn giai đoạn hiện tại của bạn.',        false, true,  1),
  ('priority_goal',  'priority_goal',  'Mục tiêu lớn nhất của bạn là gì?', 'Chọn 1 mục tiêu để cá nhân hóa lộ trình.', false, true,  2),
  ('pain_point',     'pain_point',     'Điều gì khiến bạn stress nhất?',   'Chọn tất cả áp lực bạn đang gặp phải.',   true,  true,  3),
  ('stamina',        NULL,             'Năng lượng tinh thần của bạn?',    'Đánh giá mức năng lượng hiện tại.',       false, true,  4),
  ('content_format', 'content_format', 'Bạn thích học theo cách nào?',     'Chọn định dạng phù hợp nhất.',            false, true,  5),
  ('mbti',           'mbti_type',      'Loại tính cách MBTI của bạn?',     'Giúp cá nhân hóa nội dung (bỏ qua được).', false, false, 6)
on conflict (step_key) do nothing;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3: Recreate user_onboardings with JSONB for multi-select
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop old table
drop table if exists user_onboardings cascade;

create table user_onboardings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  answers         jsonb not null default '{}',
  /*
    answers structure:
    {
      "career_stage": "uuid",           -- single value
      "priority_goal": "uuid",          -- single value
      "pain_point": ["uuid1", "uuid2"], -- array for multiple
      "stamina": 5,                     -- integer
      "content_format": "uuid",         -- single value
      "mbti_type": "uuid"               -- single value or null
    }
  */
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id)
);

create index user_onboardings_user on user_onboardings (user_id);
create index user_onboardings_answers on user_onboardings using gin (answers);

-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════════════════════════════

alter table user_onboardings enable row level security;

create policy "Users can view own onboarding"
  on user_onboardings for select
  using (auth.uid() = user_id);

create policy "Users can insert own onboarding"
  on user_onboardings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own onboarding"
  on user_onboardings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- Trigger
-- ═══════════════════════════════════════════════════════════════════════════════

create trigger user_onboardings_updated_at
  before update on user_onboardings
  for each row execute procedure set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 4: Mark pain_point as multiple in master_data
-- ═══════════════════════════════════════════════════════════════════════════════

update master_data set multiple = true where type = 'pain_point';
