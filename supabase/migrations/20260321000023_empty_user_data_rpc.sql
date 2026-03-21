-- ============================================================
-- Migration 023: RPC function to reset user data
--
-- Clears all user-generated data and resets onboarding_done
-- so the user can start fresh.
-- ============================================================

create or replace function empty_user_data(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- History tables
  delete from xp_history       where user_id = p_user_id;
  delete from stamina_history   where user_id = p_user_id;
  delete from streak_history    where user_id = p_user_id;
  delete from daily_stats       where user_id = p_user_id;

  -- Skill nodes progress & generated skill_nodes
  delete from skill_nodes
  where node_id in (
    select node_id from user_skill_nodes where user_id = p_user_id
  ) and node_id like 'gen_%';

  delete from user_skill_nodes  where user_id = p_user_id;

  -- Quests & generated quests
  delete from quests
  where quest_id in (
    select quest_id from user_quests where user_id = p_user_id
  ) and quest_id like 'gen_%';

  delete from user_quests       where user_id = p_user_id;

  -- Generation tracking
  delete from generation_tracking where user_id = p_user_id;

  -- Prompt executions
  delete from prompt_executions where user_id = p_user_id;

  -- Daily bonuses
  delete from daily_bonuses     where user_id = p_user_id;

  -- Reset profile onboarding
  update profiles
  set onboarding_done = false,
      level = 1,
      total_xp = 0,
      current_xp_in_level = 0,
      xp_to_next_level = 100,
      streak = 0,
      best_streak = 0,
      stamina = 100,
      primary_branch = null,
      shields_remaining = 2
  where id = p_user_id;
end;
$$;

grant execute on function empty_user_data(uuid) to authenticated;

comment on function empty_user_data is
'Resets all user data: history, quests, skill nodes, tracking, bonuses. Resets profile to initial state with onboarding_done = false.';
