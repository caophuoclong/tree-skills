-- ============================================================
-- Migration 019: Skill Node Dependencies
--
-- Auto-generate tier-based dependencies and helper functions
-- ============================================================

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Function: Auto-generate dependencies by tier
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function generate_tier_dependencies()
returns void as $$
begin
  -- Clear existing auto-generated dependencies
  delete from skill_node_dependencies;

  -- Tier 2 nodes depend on ALL Tier 1 nodes in same branch
  insert into skill_node_dependencies (node_id, requires_node)
  select t2.node_id, t1.node_id
  from skill_nodes t2
  cross join skill_nodes t1
  where t2.tier = 2
    and t1.tier = 1
    and t2.branch = t1.branch;

  -- Tier 3 nodes depend on ALL Tier 2 nodes in same branch
  insert into skill_node_dependencies (node_id, requires_node)
  select t3.node_id, t2.node_id
  from skill_nodes t3
  cross join skill_nodes t2
  where t3.tier = 3
    and t2.tier = 2
    and t3.branch = t2.branch;

  -- Also add dependencies within same tier (sequential)
  -- Each node depends on the previous node in the same tier
  insert into skill_node_dependencies (node_id, requires_node)
  select curr.node_id, prev.node_id
  from skill_nodes curr
  join skill_nodes prev on curr.branch = prev.branch
    and curr.tier = prev.tier
    and prev.tier_order < curr.tier_order
    and prev.tier_order = (
      select max(tier_order) from skill_nodes
      where branch = curr.branch and tier = curr.tier and tier_order < curr.tier_order
    );
end;
$$ language plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Function: Get unlocked nodes for a user
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function get_unlocked_nodes(p_user_id uuid)
returns table (
  node_id text,
  branch text,
  tier int,
  title text,
  description text,
  xp_required int,
  quests_total int,
  status text,
  quests_completed int,
  is_locked boolean
) as $$
begin
  return query
  select
    sn.node_id,
    sn.branch::text,
    sn.tier,
    sn.title,
    sn.description,
    sn.xp_required,
    sn.quests_total,
    coalesce(usn.status::text, 'locked') as status,
    coalesce(usn.quests_completed, 0) as quests_completed,
    -- Node is locked if it has unmet dependencies
    exists (
      select 1 from skill_node_dependencies snd
      where snd.node_id = sn.node_id
        and not exists (
          select 1 from user_skill_nodes usn2
          where usn2.user_id = p_user_id
            and usn2.node_id = snd.requires_node
            and usn2.status = 'completed'
        )
    ) as is_locked
  from skill_nodes sn
  left join user_skill_nodes usn on usn.node_id = sn.node_id and usn.user_id = p_user_id
  order by sn.branch, sn.tier, sn.tier_order;
end;
$$ language plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Function: Check if node can be unlocked
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function can_unlock_node(p_user_id uuid, p_node_id text)
returns boolean as $$
declare
  v_unmet_count int;
begin
  -- Count unmet dependencies
  select count(*) into v_unmet_count
  from skill_node_dependencies snd
  where snd.node_id = p_node_id
    and not exists (
      select 1 from user_skill_nodes usn
      where usn.user_id = p_user_id
        and usn.node_id = snd.requires_node
        and usn.status = 'completed'
    );

  return v_unmet_count = 0;
end;
$$ language plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Function: Get locked quests for user (from locked nodes)
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function get_locked_quests(p_user_id uuid)
returns table (
  quest_id text,
  title text,
  branch text,
  node_id text,
  node_title text,
  node_tier int
) as $$
begin
  return query
  select
    q.quest_id,
    q.title,
    q.branch::text,
    q.node_id,
    sn.title as node_title,
    sn.tier as node_tier
  from quests q
  join skill_nodes sn on q.node_id = sn.node_id
  where exists (
    select 1 from skill_node_dependencies snd
    where snd.node_id = sn.node_id
      and not exists (
        select 1 from user_skill_nodes usn
        where usn.user_id = p_user_id
          and usn.node_id = snd.requires_node
          and usn.status = 'completed'
      )
  );
end;
$$ language plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. Auto-run dependency generation
-- ═══════════════════════════════════════════════════════════════════════════════

select generate_tier_dependencies();
