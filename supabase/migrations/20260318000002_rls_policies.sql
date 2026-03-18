-- ============================================================
-- Migration 002: Row Level Security Policies
-- ============================================================

-- Enable RLS on all user-specific tables
alter table profiles           enable row level security;
alter table user_skill_nodes   enable row level security;
alter table user_quests        enable row level security;
alter table user_challenges    enable row level security;
alter table roadmap_milestones enable row level security;
alter table custom_goal_trees  enable row level security;
alter table notifications      enable row level security;

-- Catalog tables: public read, no user writes
alter table skill_nodes  enable row level security;
alter table quests       enable row level security;
alter table challenges   enable row level security;

-- ─── profiles ─────────────────────────────────────────────────────────────────
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Insert handled by trigger (security definer), no direct user insert

-- ─── skill_nodes (public read) ────────────────────────────────────────────────
create policy "Anyone can read skill nodes"
  on skill_nodes for select
  using (true);

-- ─── quests (public read) ─────────────────────────────────────────────────────
create policy "Anyone can read quests"
  on quests for select
  using (true);

-- ─── challenges (public read) ─────────────────────────────────────────────────
create policy "Anyone can read challenges"
  on challenges for select
  using (true);

-- ─── user_skill_nodes ─────────────────────────────────────────────────────────
create policy "Users can view own skill node progress"
  on user_skill_nodes for select
  using (auth.uid() = user_id);

create policy "Users can insert own skill node progress"
  on user_skill_nodes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own skill node progress"
  on user_skill_nodes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── user_quests ──────────────────────────────────────────────────────────────
create policy "Users can view own quest completions"
  on user_quests for select
  using (auth.uid() = user_id);

create policy "Users can record own quest completions"
  on user_quests for insert
  with check (auth.uid() = user_id);

-- ─── user_challenges ──────────────────────────────────────────────────────────
create policy "Users can view own challenges"
  on user_challenges for select
  using (auth.uid() = user_id);

create policy "Users can join challenges"
  on user_challenges for insert
  with check (auth.uid() = user_id);

create policy "Users can update own challenge progress"
  on user_challenges for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can leave challenges"
  on user_challenges for delete
  using (auth.uid() = user_id);

-- ─── roadmap_milestones ───────────────────────────────────────────────────────
create policy "Users can view own milestones"
  on roadmap_milestones for select
  using (auth.uid() = user_id);

create policy "Users can create milestones"
  on roadmap_milestones for insert
  with check (auth.uid() = user_id);

create policy "Users can update own milestones"
  on roadmap_milestones for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own milestones"
  on roadmap_milestones for delete
  using (auth.uid() = user_id);

-- ─── custom_goal_trees ────────────────────────────────────────────────────────
create policy "Users can view own goal trees"
  on custom_goal_trees for select
  using (auth.uid() = user_id);

create policy "Users can create goal trees"
  on custom_goal_trees for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goal trees"
  on custom_goal_trees for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own goal trees"
  on custom_goal_trees for delete
  using (auth.uid() = user_id);

-- ─── notifications ────────────────────────────────────────────────────────────
create policy "Users can view own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can mark own notifications read"
  on notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own notifications"
  on notifications for delete
  using (auth.uid() = user_id);

-- Service role can insert notifications (for server-side push)
create policy "Service role can insert notifications"
  on notifications for insert
  with check (auth.role() = 'service_role');
