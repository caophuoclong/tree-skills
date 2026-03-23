-- ============================================================
-- Migration 026: Add unique constraint on user_quests
--
-- Prevents duplicate quest entries per user.
-- Cleans up existing duplicates first (keeps latest).
-- ============================================================

-- 1. Remove duplicates: keep the row with the latest created_at
delete from user_quests a
using user_quests b
where a.user_id = b.user_id
  and a.quest_id = b.quest_id
  and a.id < b.id;

-- 2. Add unique constraint
alter table user_quests
  add constraint user_quests_user_quest_unique
  unique (user_id, quest_id);
