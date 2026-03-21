-- ============================================================
-- Migration 011: Unified Master Data Table
--
-- All game configuration and master data in one table.
-- Easy to manage, extend, and version.
-- ============================================================

-- ─── Table ────────────────────────────────────────────────────────────────────

create table master_data (
  id            uuid primary key default gen_random_uuid(),
  type          text not null,                    -- data category
  key           text not null,                    -- unique key within type
  data          jsonb not null default '{}',      -- the actual data
  description   text not null default '',
  is_active     boolean not null default true,
  sort_order    int not null default 0,
  version       int not null default 1,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (type, key)
);

create index master_data_type on master_data (type);
create index master_data_type_active on master_data (type, is_active);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table master_data enable row level security;

-- Public read, no client writes
create policy "Anyone can read master data"
  on master_data for select using (true);

create policy "No public write master data"
  on master_data for all using (false);

-- ─── Trigger ──────────────────────────────────────────────────────────────────

create trigger master_data_updated_at
  before update on master_data
  for each row execute procedure set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── XP Levels ────────────────────────────────────────────────────────────────

insert into master_data (type, key, data, description, sort_order) values
  ('xp_level', '1',  '{"xp_required": 100, "xp_total": 0}',    'Level 1', 1),
  ('xp_level', '2',  '{"xp_required": 150, "xp_total": 100}',  'Level 2', 2),
  ('xp_level', '3',  '{"xp_required": 200, "xp_total": 250}',  'Level 3', 3),
  ('xp_level', '4',  '{"xp_required": 275, "xp_total": 450}',  'Level 4', 4),
  ('xp_level', '5',  '{"xp_required": 350, "xp_total": 725}',  'Level 5', 5),
  ('xp_level', '6',  '{"xp_required": 450, "xp_total": 1075}', 'Level 6', 6),
  ('xp_level', '7',  '{"xp_required": 575, "xp_total": 1525}', 'Level 7', 7),
  ('xp_level', '8',  '{"xp_required": 725, "xp_total": 2100}', 'Level 8', 8),
  ('xp_level', '9',  '{"xp_required": 900, "xp_total": 2825}', 'Level 9', 9),
  ('xp_level', '10', '{"xp_required": 1100, "xp_total": 3725}','Level 10', 10)
on conflict (type, key) do nothing;

-- ─── Level Rewards ────────────────────────────────────────────────────────────

insert into master_data (type, key, data, description, sort_order) values
  ('level_reward', '2',  '{"title": "Khởi đầu tốt!", "description": "Bạn đã vượt qua cấp độ đầu tiên!", "xp_bonus": 50, "unlock": "Mở khóa nhánh mới"}', 'Level 2 reward', 2),
  ('level_reward', '3',  '{"title": "Đang tiến bộ!", "description": "Kỹ năng của bạn đang phát triển.", "xp_bonus": 75, "unlock": "Mở khóa nhiệm vụ khó hơn"}', 'Level 3 reward', 3),
  ('level_reward', '4',  '{"title": "Bốn cấp độ!", "description": "Bạn đã xây dựng nền tảng vững chắc.", "xp_bonus": 100, "unlock": "Mở khóa thử thách tuần"}', 'Level 4 reward', 4),
  ('level_reward', '5',  '{"title": "Nửa chặng đường!", "description": "Bạn đã đạt đến nửa chặng đường!", "xp_bonus": 125, "unlock": "Mở khóa kỹ năng cấp 3"}', 'Level 5 reward', 5),
  ('level_reward', '6',  '{"title": "Sáu cấp độ!", "description": "Sự kiên trì của bạn thật ấn tượng.", "xp_bonus": 150, "unlock": "Mở khóa nhiệm vụ đặc biệt"}', 'Level 6 reward', 6),
  ('level_reward', '7',  '{"title": "Gần đến đích!", "description": "Bạn sắp trở thành bậc thầy!", "xp_bonus": 175, "unlock": "Mở khóa chế độ khó"}', 'Level 7 reward', 7),
  ('level_reward', '8',  '{"title": "Tám cấp độ!", "description": "Bạn đã vượt qua大部分 thử thách.", "xp_bonus": 200, "unlock": "Mở khóa kỹ năng tối thượng"}', 'Level 8 reward', 8),
  ('level_reward', '9',  '{"title": "Sắp hoàn thành!", "description": "Chỉ còn một cấp độ nữa!", "xp_bonus": 250, "unlock": "Mở khóa thử thách cuối"}', 'Level 9 reward', 9),
  ('level_reward', '10', '{"title": "Bậc thầy!", "description": "Bạn đã đạt cấp độ tối đa! Chúc mừng!", "xp_bonus": 300, "unlock": "Hoàn thành tất cả nhánh"}', 'Level 10 reward', 10)
on conflict (type, key) do nothing;

-- ─── Stamina Config ───────────────────────────────────────────────────────────

insert into master_data (type, key, data, description) values
  ('stamina_config', 'drain_career_finance', '{"value": 10}',   'Stamina drain for career/finance quests'),
  ('stamina_config', 'restore_wellbeing',    '{"value": -8}',   'Stamina restore for wellbeing quests'),
  ('stamina_config', 'fail_penalty',         '{"value": 5}',    'Stamina penalty for failed quest'),
  ('stamina_config', 'wellbeing_restore',    '{"value": 15}',   'Stamina restore for wellbeing completion'),
  ('stamina_config', 'max_stamina',          '{"value": 100}',  'Maximum stamina'),
  ('stamina_config', 'min_stamina',          '{"value": 0}',    'Minimum stamina'),
  ('stamina_config', 'gated_stamina',        '{"value": 30}',   'Below this gates career/finance')
on conflict (type, key) do nothing;

-- ─── Stamina Thresholds ───────────────────────────────────────────────────────

insert into master_data (type, key, data, description, sort_order) values
  ('stamina_threshold', '0',  '{"status": "gate", "xp_multiplier": 0.00}', 'Stamina depleted — only wellbeing', 1),
  ('stamina_threshold', '1',  '{"status": "debuff", "xp_multiplier": 0.50}', 'Very low stamina — reduced XP', 2),
  ('stamina_threshold', '30', '{"status": "warning", "xp_multiplier": 0.75}', 'Low stamina — slightly reduced XP', 3),
  ('stamina_threshold', '60', '{"status": "ok", "xp_multiplier": 1.00}', 'Normal stamina — full XP', 4)
on conflict (type, key) do nothing;

-- ─── Combo Multipliers ────────────────────────────────────────────────────────

insert into master_data (type, key, data, description, sort_order) values
  ('combo_multiplier', '0', '{"multiplier": 1.00}', 'No combo — standard XP', 1),
  ('combo_multiplier', '3', '{"multiplier": 1.50}', '3 quest streak — 1.5x XP', 2),
  ('combo_multiplier', '4', '{"multiplier": 1.75}', '4 quest streak — 1.75x XP', 3),
  ('combo_multiplier', '5', '{"multiplier": 2.00}', '5+ quest streak — 2x XP', 4)
on conflict (type, key) do nothing;

-- ─── Streak Milestones ────────────────────────────────────────────────────────

insert into master_data (type, key, data, description, sort_order) values
  ('streak_milestone', '7',   '{"label": "Tuần đầu tiên", "xp_reward": 50, "icon": "🔥"}',  '7 day streak', 1),
  ('streak_milestone', '14',  '{"label": "Hai tuần", "xp_reward": 100, "icon": "🔥"}',     '14 day streak', 2),
  ('streak_milestone', '30',  '{"label": "Một tháng", "xp_reward": 200, "icon": "🏆"}',     '30 day streak', 3),
  ('streak_milestone', '60',  '{"label": "Hai tháng", "xp_reward": 350, "icon": "⭐"}',     '60 day streak', 4),
  ('streak_milestone', '100', '{"label": "100 ngày", "xp_reward": 500, "icon": "💎"}',      '100 day streak', 5)
on conflict (type, key) do nothing;

-- ─── Branch Keywords ──────────────────────────────────────────────────────────

insert into master_data (type, key, data, description, sort_order) values
  -- Career
  ('branch_keyword', 'career_1',  '{"branch": "career", "keyword": "lập trình", "weight": 3}', '', 1),
  ('branch_keyword', 'career_2',  '{"branch": "career", "keyword": "coding", "weight": 3}', '', 2),
  ('branch_keyword', 'career_3',  '{"branch": "career", "keyword": "developer", "weight": 3}', '', 3),
  ('branch_keyword', 'career_4',  '{"branch": "career", "keyword": "python", "weight": 3}', '', 4),
  ('branch_keyword', 'career_5',  '{"branch": "career", "keyword": "javascript", "weight": 3}', '', 5),
  ('branch_keyword', 'career_6',  '{"branch": "career", "keyword": "react", "weight": 3}', '', 6),
  ('branch_keyword', 'career_7',  '{"branch": "career", "keyword": "phát triển", "weight": 2}', '', 7),
  ('branch_keyword', 'career_8',  '{"branch": "career", "keyword": "công việc", "weight": 2}', '', 8),
  ('branch_keyword', 'career_9',  '{"branch": "career", "keyword": "nghề nghiệp", "weight": 2}', '', 9),
  ('branch_keyword', 'career_10', '{"branch": "career", "keyword": "phỏng vấn", "weight": 2}', '', 10),
  ('branch_keyword', 'career_11', '{"branch": "career", "keyword": "CV", "weight": 2}', '', 11),
  ('branch_keyword', 'career_12', '{"branch": "career", "keyword": "portfolio", "weight": 2}', '', 12),
  ('branch_keyword', 'career_13', '{"branch": "career", "keyword": "database", "weight": 2}', '', 13),
  ('branch_keyword', 'career_14', '{"branch": "career", "keyword": "sql", "weight": 2}', '', 14),
  ('branch_keyword', 'career_15', '{"branch": "career", "keyword": "marketing", "weight": 2}', '', 15),

  -- Finance
  ('branch_keyword', 'finance_1',  '{"branch": "finance", "keyword": "tài chính", "weight": 3}', '', 20),
  ('branch_keyword', 'finance_2',  '{"branch": "finance", "keyword": "đầu tư", "weight": 3}', '', 21),
  ('branch_keyword', 'finance_3',  '{"branch": "finance", "keyword": "tiết kiệm", "weight": 3}', '', 22),
  ('branch_keyword', 'finance_4',  '{"branch": "finance", "keyword": "tiền bạc", "weight": 2}', '', 23),
  ('branch_keyword', 'finance_5',  '{"branch": "finance", "keyword": "ngân sách", "weight": 2}', '', 24),
  ('branch_keyword', 'finance_6',  '{"branch": "finance", "keyword": "cổ phiếu", "weight": 2}', '', 25),
  ('branch_keyword', 'finance_7',  '{"branch": "finance", "keyword": "crypto", "weight": 2}', '', 26),
  ('branch_keyword', 'finance_8',  '{"branch": "finance", "keyword": "bitcoin", "weight": 2}', '', 27),
  ('branch_keyword', 'finance_9',  '{"branch": "finance", "keyword": "thu nhập", "weight": 2}', '', 28),
  ('branch_keyword', 'finance_10', '{"branch": "finance", "keyword": "chi tiêu", "weight": 2}', '', 29),

  -- Softskills
  ('branch_keyword', 'soft_1',  '{"branch": "softskills", "keyword": "giao tiếp", "weight": 3}', '', 30),
  ('branch_keyword', 'soft_2',  '{"branch": "softskills", "keyword": "thuyết trình", "weight": 3}', '', 31),
  ('branch_keyword', 'soft_3',  '{"branch": "softskills", "keyword": "tư duy", "weight": 2}', '', 32),
  ('branch_keyword', 'soft_4',  '{"branch": "softskills", "keyword": "lãnh đạo", "weight": 2}', '', 33),
  ('branch_keyword', 'soft_5',  '{"branch": "softskills", "keyword": "làm việc nhóm", "weight": 2}', '', 34),
  ('branch_keyword', 'soft_6',  '{"branch": "softskills", "keyword": "đàm phán", "weight": 2}', '', 35),
  ('branch_keyword', 'soft_7',  '{"branch": "softskills", "keyword": "networking", "weight": 2}', '', 36),
  ('branch_keyword', 'soft_8',  '{"branch": "softskills", "keyword": "phản biện", "weight": 2}', '', 37),
  ('branch_keyword', 'soft_9',  '{"branch": "softskills", "keyword": "sáng tạo", "weight": 2}', '', 38),
  ('branch_keyword', 'soft_10', '{"branch": "softskills", "keyword": "giải quyết vấn đề", "weight": 2}', '', 39),

  -- Wellbeing
  ('branch_keyword', 'well_1',  '{"branch": "wellbeing", "keyword": "sức khỏe", "weight": 3}', '', 40),
  ('branch_keyword', 'well_2',  '{"branch": "wellbeing", "keyword": "gym", "weight": 3}', '', 41),
  ('branch_keyword', 'well_3',  '{"branch": "wellbeing", "keyword": "yoga", "weight": 3}', '', 42),
  ('branch_keyword', 'well_4',  '{"branch": "wellbeing", "keyword": "thiền", "weight": 3}', '', 43),
  ('branch_keyword', 'well_5',  '{"branch": "wellbeing", "keyword": "meditation", "weight": 3}', '', 44),
  ('branch_keyword', 'well_6',  '{"branch": "wellbeing", "keyword": "ngủ", "weight": 2}', '', 45),
  ('branch_keyword', 'well_7',  '{"branch": "wellbeing", "keyword": "dinh dưỡng", "weight": 2}', '', 46),
  ('branch_keyword', 'well_8',  '{"branch": "wellbeing", "keyword": "tập thể dục", "weight": 2}', '', 47),
  ('branch_keyword', 'well_9',  '{"branch": "wellbeing", "keyword": "stress", "weight": 2}', '', 48),
  ('branch_keyword', 'well_10', '{"branch": "wellbeing", "keyword": "cân bằng", "weight": 2}', '', 49)
on conflict (type, key) do nothing;

-- ─── Game Constants ───────────────────────────────────────────────────────────

insert into master_data (type, key, data, description) values
  ('game_constant', 'max_level',           '{"value": 10}',  'Maximum player level'),
  ('game_constant', 'max_level_xp',        '{"value": 9999}','Max XP display cap'),
  ('game_constant', 'shield_count',        '{"value": 2}',   'Number of streak shields'),
  ('game_constant', 'daily_bonus_base',    '{"value": 20}',  'Base daily login bonus XP'),
  ('game_constant', 'daily_bonus_3_streak','{"value": 30}',  'Daily bonus at 3-day streak'),
  ('game_constant', 'daily_bonus_7_streak','{"value": 50}',  'Daily bonus at 7+ day streak')
on conflict (type, key) do nothing;
