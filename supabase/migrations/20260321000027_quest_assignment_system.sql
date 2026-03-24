-- ============================================================
-- Migration 027: Quest Assignment System
--
-- 1. Add assigned column to user_quests
-- 2. Seed assignment rules in master_data
-- 3. Create assign_daily_quests RPC
-- 4. Migrate existing data
-- ============================================================

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Add assigned column
-- ═══════════════════════════════════════════════════════════════════════════════

alter table user_quests add column if not exists assigned boolean not null default false;

-- Backfill: existing rows with today's date are considered assigned
update user_quests
set assigned = true
where date = current_date;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Seed assignment rules in master_data
-- ═══════════════════════════════════════════════════════════════════════════════

-- Daily quest limit
insert into master_data (type, key, data, description)
values (
  'quest_assignment',
  'daily_limit',
  '{
    "base": 5,
    "stamina_bonus": { "60": 1, "80": 2, "100": 3 },
    "streak_bonus": { "7": 1, "14": 2, "30": 3 }
  }'::jsonb,
  'Base daily quests + bonuses from stamina and streak'
) on conflict (type, key) do update set data = excluded.data;

-- Branch distribution: how many quests per branch per day
insert into master_data (type, key, data, description)
values (
  'quest_assignment',
  'branch_distribution',
  '{
    "career": 2,
    "finance": 1,
    "softskills": 1,
    "wellbeing": 1
  }'::jsonb,
  'Default daily quest distribution across branches'
) on conflict (type, key) do update set data = excluded.data;

-- Difficulty distribution: ratio of easy/medium/hard
insert into master_data (type, key, data, description)
values (
  'quest_assignment',
  'difficulty_distribution',
  '{
    "easy": 0.4,
    "medium": 0.4,
    "hard": 0.2
  }'::jsonb,
  'Ratio of quest difficulties in daily assignment'
) on conflict (type, key) do update set data = excluded.data;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Function: Assign daily quests
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function assign_daily_quests(p_user_id uuid)
returns table (
  quest_id text,
  branch text,
  difficulty text,
  xp_reward int
) as $$
declare
  v_today date := current_date;
  v_already_assigned int;
  v_daily_limit int;
  v_branch_dist jsonb;
  v_branch text;
  v_branch_count int;
  v_quests_needed int;
  v_assigned_count int := 0;
  v_rec record;
begin
  -- Check if already assigned today
  select count(*) into v_already_assigned
  from user_quests
  where user_id = p_user_id and date = v_today and assigned = true;

  if v_already_assigned > 0 then
    -- Already assigned, return existing
    return query
    select uq.quest_id, q.branch::text, q.difficulty::text, q.xp_reward
    from user_quests uq
    join quests q on q.quest_id = uq.quest_id
    where uq.user_id = p_user_id and uq.date = v_today and uq.assigned = true;
    return;
  end if;

  -- Get daily limit from master_data
  select coalesce((md.data->>'base')::int, 5) into v_daily_limit
  from master_data md
  where md.type = 'quest_assignment' and md.key = 'daily_limit' and md.is_active = true;

  -- Get branch distribution from master_data
  select md.data into v_branch_dist
  from master_data md
  where md.type = 'quest_assignment' and md.key = 'branch_distribution' and md.is_active = true;

  -- Loop through each branch and assign quests
  for v_branch, v_branch_count in
    select key, value::int
    from jsonb_each_text(v_branch_dist)
  loop
    v_quests_needed := v_branch_count;

    -- Find available quests for this branch:
    -- 1. From user's unlocked nodes (tier 1 first, then 2, then 3)
    -- 2. Not already assigned today
    -- 3. Not completed (or completed more than 7 days ago for repeat)
    -- 4. Quest node must be unlocked (all dependencies met)
    for v_rec in
      select q.quest_id, q.xp_reward, q.difficulty
      from quests q
      join skill_nodes sn on sn.node_id = q.node_id
      where sn.branch::branch_type = v_branch::branch_type
        -- Node must be in user's unlocked nodes
        and exists (
          select 1 from user_skill_nodes usn
          where usn.user_id = p_user_id
            and usn.node_id = sn.node_id
            and usn.status in ('in_progress', 'todo')
        )
        -- Not already assigned today
        and not exists (
          select 1 from user_quests uq
          where uq.user_id = p_user_id
            and uq.quest_id = q.quest_id
            and uq.date = v_today
        )
        -- Not completed (or allow repeats after 7 days)
        and not exists (
          select 1 from user_quests uq
          where uq.user_id = p_user_id
            and uq.quest_id = q.quest_id
            and uq.completed_at is not null
            and uq.completed_at > now() - interval '7 days'
        )
      order by sn.tier asc, sn.tier_order asc, random()
      limit v_quests_needed
    loop
      -- Insert assignment
      insert into user_quests (user_id, quest_id, date, xp_earned, assigned, completed_at)
      values (p_user_id, v_rec.quest_id, v_today, v_rec.xp_reward, true, null)
      on conflict (user_id, quest_id) do update
        set date = v_today,
            assigned = true,
            xp_earned = v_rec.xp_reward,
            completed_at = case when user_quests.completed_at is not null and user_quests.date = v_today
                           then user_quests.completed_at
                           else null end;

      v_assigned_count := v_assigned_count + 1;

      -- Return the assigned quest
      quest_id := v_rec.quest_id;
      branch := v_branch;
      difficulty := v_rec.difficulty;
      xp_reward := v_rec.xp_reward;
      return next;
    end loop;
  end loop;
end;
$$ language plpgsql security definer;

grant execute on function assign_daily_quests(uuid) to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Updated get_unlocked_nodes to include quest assignment info
-- ═══════════════════════════════════════════════════════════════════════════════

-- No changes needed — existing function works with user_skill_nodes
