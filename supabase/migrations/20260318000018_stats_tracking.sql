-- ============================================================
-- Migration 018: Stats Tracking & Quest Completion System
--
-- Tracks XP history, stamina changes, streaks, and manages
-- skill node progression based on quest completion.
-- ============================================================

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. XP History - Track all XP gains
-- ═══════════════════════════════════════════════════════════════════════════════

create table xp_history (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  amount          int not null,
  source          text not null,                    -- 'quest', 'daily_bonus', 'streak', 'level_up', 'challenge'
  source_id       text,                             -- quest_id, challenge_id, etc.
  multiplier      numeric(3,2) not null default 1.00,
  created_at      timestamptz not null default now()
);

create index xp_history_user on xp_history (user_id);
create index xp_history_source on xp_history (source);

alter table xp_history enable row level security;

create policy "Users can view own xp history"
  on xp_history for select using (auth.uid() = user_id);

create policy "Service role can insert xp history"
  on xp_history for insert with check (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Stamina History - Track stamina changes
-- ═══════════════════════════════════════════════════════════════════════════════

create table stamina_history (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  amount          int not null,                     -- positive = gain, negative = drain
  source          text not null,                    -- 'quest_complete', 'quest_fail', 'wellbeing', 'daily'
  stamina_before  int not null,
  stamina_after   int not null,
  created_at      timestamptz not null default now()
);

create index stamina_history_user on stamina_history (user_id);

alter table stamina_history enable row level security;

create policy "Users can view own stamina history"
  on stamina_history for select using (auth.uid() = user_id);

create policy "Service role can insert stamina history"
  on stamina_history for insert with check (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Streak History - Track daily streaks
-- ═══════════════════════════════════════════════════════════════════════════════

create table streak_history (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  date            date not null,
  quests_completed int not null default 0,
  xp_earned       int not null default 0,
  streak_day      int not null,                     -- which day of the streak
  shield_used     boolean not null default false,
  created_at      timestamptz not null default now(),
  unique (user_id, date)
);

create index streak_history_user_date on streak_history (user_id, date);

alter table streak_history enable row level security;

create policy "Users can view own streak history"
  on streak_history for select using (auth.uid() = user_id);

create policy "Service role can manage streak history"
  on streak_history for all using (true) with check (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Daily Stats - Track daily progress
-- ═══════════════════════════════════════════════════════════════════════════════

create table daily_stats (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references auth.users(id) on delete cascade,
  date                      date not null,
  quests_completed          int not null default 0,
  quests_total              int not null default 0,
  xp_earned                 int not null default 0,
  wellbeing_quests          int not null default 0,
  career_finance_quests     int not null default 0,
  stamina_start             int not null default 100,
  stamina_end               int not null default 100,
  streak_day                int not null default 0,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  unique (user_id, date)
);

create index daily_stats_user_date on daily_stats (user_id, date);

alter table daily_stats enable row level security;

create policy "Users can view own daily stats"
  on daily_stats for select using (auth.uid() = user_id);

create policy "Service role can manage daily stats"
  on daily_stats for all using (true) with check (true);

create trigger daily_stats_updated_at
  before update on daily_stats
  for each row execute procedure set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. Skill Node Dependencies - Track which nodes unlock others
-- ═══════════════════════════════════════════════════════════════════════════════

create table skill_node_dependencies (
  node_id         text not null references skill_nodes(node_id) on delete cascade,
  requires_node   text not null references skill_nodes(node_id) on delete cascade,
  primary key (node_id, requires_node)
);

alter table skill_node_dependencies enable row level security;

create policy "Anyone can read node dependencies"
  on skill_node_dependencies for select using (true);

create policy "Service role can manage dependencies"
  on skill_node_dependencies for all using (true) with check (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. Add sort_order to skill_nodes if not exists
-- ═══════════════════════════════════════════════════════════════════════════════

alter table skill_nodes add column if not exists tier_order int not null default 0;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. Function: Check if node is unlocked for user
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function is_node_unlocked(p_user_id uuid, p_node_id text)
returns boolean as $$
declare
  v_node_tier int;
  v_completed_lower int;
  v_required_lower int;
begin
  -- Get node tier
  select tier into v_node_tier
  from skill_nodes
  where node_id = p_node_id;

  -- Tier 1 nodes are always unlocked
  if v_node_tier = 1 then
    return true;
  end if;

  -- Count completed nodes in lower tiers
  select count(*) into v_completed_lower
  from user_skill_nodes usn
  join skill_nodes sn on usn.node_id = sn.node_id
  where usn.user_id = p_user_id
    and sn.branch = (select branch from skill_nodes where node_id = p_node_id)
    and sn.tier < v_node_tier
    and usn.status = 'completed';

  -- Count required nodes in lower tiers
  select count(*) into v_required_lower
  from skill_nodes
  where branch = (select branch from skill_nodes where node_id = p_node_id)
    and tier < v_node_tier;

  -- Node is unlocked if all lower tier nodes are completed
  return v_completed_lower >= v_required_lower;
end;
$$ language plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. Function: Update skill node progress on quest completion
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function update_skill_node_on_quest_complete()
returns trigger as $$
declare
  v_node_id text;
  v_quests_total int;
  v_quests_completed int;
begin
  -- Get the node_id for this quest
  select node_id into v_node_id
  from quests
  where quest_id = NEW.quest_id;

  -- If no node_id, skip
  if v_node_id is null then
    return NEW;
  end if;

  -- Get total quests for this node
  select quests_total into v_quests_total
  from skill_nodes
  where node_id = v_node_id;

  -- Get completed quests count
  select count(*) into v_quests_completed
  from user_quests uq
  join quests q on uq.quest_id = q.quest_id
  where uq.user_id = NEW.user_id
    and q.node_id = v_node_id
    and uq.completed_at is not null;

  -- Update user_skill_nodes
  update user_skill_nodes
  set quests_completed = v_quests_completed,
      status = case
        when v_quests_completed >= v_quests_total then 'completed'
        when v_quests_completed > 0 then 'in_progress'
        else status
      end,
      completed_at = case
        when v_quests_completed >= v_quests_total then now()
        else completed_at
      end
  where user_id = NEW.user_id
    and node_id = v_node_id;

  -- If node completed, check if next tier should unlock
  if v_quests_completed >= v_quests_total then
    -- Unlock next tier nodes
    update user_skill_nodes
    set status = 'in_progress',
        unlocked_at = now()
    where user_id = NEW.user_id
      and node_id in (
        select sn.node_id
        from skill_nodes sn
        where sn.branch = (select branch from skill_nodes where node_id = v_node_id)
          and sn.tier = (select tier + 1 from skill_nodes where node_id = v_node_id)
      )
      and status = 'locked'
      and not exists (
        select 1 from user_skill_nodes usn2
        join skill_nodes sn2 on usn2.node_id = sn2.node_id
        where usn2.user_id = NEW.user_id
          and sn2.branch = (select branch from skill_nodes where node_id = v_node_id)
          and sn2.tier = (select tier from skill_nodes where node_id = v_node_id)
          and usn2.status != 'completed'
      );
  end if;

  return NEW;
end;
$$ language plpgsql;

-- Trigger on user_quests completion
create trigger on_quest_complete
  after update of completed_at on user_quests
  for each row
  when (NEW.completed_at is not null and OLD.completed_at is null)
  execute function update_skill_node_on_quest_complete();
