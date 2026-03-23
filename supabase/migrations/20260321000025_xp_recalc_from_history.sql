-- ============================================================
-- Migration 025: XP computation from xp_history
--
-- Function to compute total XP, level, and progress from
-- xp_history table. Trigger fires on xp_history insert to
-- auto-update the user's profile.
-- ============================================================

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Function: Recalculate user XP from xp_history
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function recalc_user_xp(p_user_id uuid)
returns void as $$
declare
  v_total_xp int;
  v_level int := 1;
  v_remaining int;
  v_xp_to_next int;
  v_max_level int := 10;
  v_threshold int;
begin
  -- Sum all XP earned from xp_history
  select coalesce(sum(amount), 0) into v_total_xp
  from xp_history
  where user_id = p_user_id;

  v_remaining := v_total_xp;

  -- Compute level by subtracting thresholds
  -- Thresholds: level 1=100, 2=150, 3=200, 4=275, 5=350, 6=450, 7=575, 8=725, 9=900, 10=1100
  while v_level < v_max_level loop
    v_threshold := case v_level
      when 1 then 100
      when 2 then 150
      when 3 then 200
      when 4 then 275
      when 5 then 350
      when 6 then 450
      when 7 then 575
      when 8 then 725
      when 9 then 900
      else 1100
    end;

    if v_remaining < v_threshold then
      exit;
    end if;

    v_remaining := v_remaining - v_threshold;
    v_level := v_level + 1;
  end loop;

  -- xp_to_next: 0 if max level
  if v_level >= v_max_level then
    v_xp_to_next := 0;
    v_remaining := 0;
  else
    v_xp_to_next := case v_level
      when 1 then 100
      when 2 then 150
      when 3 then 200
      when 4 then 275
      when 5 then 350
      when 6 then 450
      when 7 then 575
      when 8 then 725
      when 9 then 900
      else 1100
    end - v_remaining;
  end if;

  -- Update profile
  update profiles
  set total_xp = v_total_xp,
      level = v_level,
      current_xp_in_level = v_remaining,
      xp_to_next_level = v_xp_to_next,
      updated_at = now()
  where id = p_user_id;
end;
$$ language plpgsql security definer;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Trigger: Auto-recalculate XP on xp_history insert
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function on_xp_history_insert()
returns trigger as $$
begin
  perform recalc_user_xp(NEW.user_id);
  return NEW;
end;
$$ language plpgsql security definer;

create trigger xp_history_after_insert
  after insert on xp_history
  for each row
  execute function on_xp_history_insert();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. RPC: Expose recalc_user_xp for client-side calls
-- ═══════════════════════════════════════════════════════════════════════════════

grant execute on function recalc_user_xp(uuid) to authenticated;

comment on function recalc_user_xp is
'Recalculates total_xp, level, current_xp_in_level, xp_to_next_level from xp_history and updates the profiles table.';
