-- ============================================================
-- Migration 026: Fix user_quests
--
-- 1. Fix completed_at default (was now(), should be null)
-- 2. Clean up duplicates (keep latest)
-- 3. Add unique constraint
-- ============================================================

-- Fix existing rows: set completed_at to null where it was auto-set by default
-- but quest was never actually completed (xp_earned = 0)
update user_quests
set completed_at = null
where completed_at is not null
  and xp_earned = 0;

-- Fix the default
alter table user_quests
  alter column completed_at set default null;

-- Remove duplicates: keep the row with the latest id
delete from user_quests a
using user_quests b
where a.user_id = b.user_id
  and a.quest_id = b.quest_id
  and a.id < b.id;

-- Add unique constraint
alter table user_quests
  add constraint user_quests_user_quest_unique
  unique (user_id, quest_id);
