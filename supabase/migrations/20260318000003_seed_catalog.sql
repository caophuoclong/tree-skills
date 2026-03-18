-- ============================================================
-- Migration 003: Seed catalog tables (skill_nodes, quests, challenges)
-- These are public read / admin write — no user_id required
-- ============================================================

-- ─── skill_nodes seed ─────────────────────────────────────────────────────────
insert into skill_nodes (node_id, branch, tier, title, description, xp_required, quests_total, sort_order) values
  -- CAREER T1
  ('career_t1_1', 'career', 1, 'Khám phá nghề nghiệp',        'Hiểu rõ thế mạnh và định hướng nghề nghiệp phù hợp',           50, 5, 10),
  ('career_t1_2', 'career', 1, 'Xây dựng CV chuyên nghiệp',   'Tạo hồ sơ ấn tượng thu hút nhà tuyển dụng',                    75, 5, 20),
  -- CAREER T2
  ('career_t2_1', 'career', 2, 'Kỹ năng phỏng vấn',          'Tự tin trả lời mọi câu hỏi phỏng vấn',                        100, 6, 30),
  ('career_t2_2', 'career', 2, 'Networking chuyên nghiệp',    'Xây dựng mạng lưới quan hệ trong ngành',                       120, 6, 40),
  -- CAREER T3
  ('career_t3_1', 'career', 3, 'Lãnh đạo và quản lý nhóm',   'Phát triển kỹ năng dẫn dắt và quản lý đội nhóm',              200, 8, 50),
  -- FINANCE T1
  ('finance_t1_1', 'finance', 1, 'Ngân sách cá nhân',         'Theo dõi thu chi và lập kế hoạch tài chính cơ bản',            50, 5, 10),
  ('finance_t1_2', 'finance', 1, 'Quỹ khẩn cấp',             'Xây dựng tấm đệm tài chính 3–6 tháng chi tiêu',                75, 5, 20),
  -- FINANCE T2
  ('finance_t2_1', 'finance', 2, 'Đầu tư cơ bản',            'Hiểu các loại tài sản và bắt đầu hành trình đầu tư',          100, 6, 30),
  ('finance_t2_2', 'finance', 2, 'Quản lý nợ',               'Xây dựng chiến lược trả nợ thông minh',                        120, 6, 40),
  -- FINANCE T3
  ('finance_t3_1', 'finance', 3, 'Tự do tài chính',          'Xây dựng nguồn thu nhập thụ động bền vững',                   200, 8, 50),
  -- SOFTSKILLS T1
  ('soft_t1_1', 'softskills', 1, 'Giao tiếp hiệu quả',       'Nói rõ ràng, lắng nghe chủ động và truyền đạt ý tưởng',        50, 5, 10),
  ('soft_t1_2', 'softskills', 1, 'Quản lý thời gian',        'Ưu tiên công việc và tối ưu năng suất hàng ngày',               75, 5, 20),
  -- SOFTSKILLS T2
  ('soft_t2_1', 'softskills', 2, 'Tư duy phản biện',         'Phân tích vấn đề và đưa ra quyết định sáng suốt',             100, 6, 30),
  ('soft_t2_2', 'softskills', 2, 'Thuyết trình & kể chuyện', 'Trình bày ý tưởng cuốn hút và đáng nhớ',                       120, 6, 40),
  -- SOFTSKILLS T3
  ('soft_t3_1', 'softskills', 3, 'Trí tuệ cảm xúc (EQ)',    'Nhận thức và điều tiết cảm xúc bản thân và người khác',        200, 8, 50),
  -- WELLBEING T1
  ('well_t1_1', 'wellbeing', 1, 'Thói quen vận động',        'Xây dựng lịch tập thể dục đều đặn phù hợp',                    50, 5, 10),
  ('well_t1_2', 'wellbeing', 1, 'Giấc ngủ chất lượng',      'Cải thiện chu kỳ ngủ và năng lượng ban ngày',                   75, 5, 20),
  -- WELLBEING T2
  ('well_t2_1', 'wellbeing', 2, 'Chánh niệm & thiền định',  'Thực hành hiện diện và giảm stress hiệu quả',                  100, 6, 30),
  ('well_t2_2', 'wellbeing', 2, 'Dinh dưỡng thông minh',    'Xây dựng chế độ ăn cân bằng hỗ trợ năng lượng',               120, 6, 40),
  -- WELLBEING T3
  ('well_t3_1', 'wellbeing', 3, 'Sức khỏe tinh thần toàn diện', 'Nuôi dưỡng tâm lý bền bỉ và hạnh phúc lâu dài',           200, 8, 50)
on conflict (node_id) do nothing;

-- ─── challenges seed ──────────────────────────────────────────────────────────
insert into challenges (id, title, description, branch, target_count, duration_days) values
  ('ch-finance-fundamentals', 'Finance Fundamentals',
   'Complete 5 finance quests to build your money management skills.',
   'finance', 5, 7),
  ('ch-wellbeing-week', 'Wellbeing Week',
   'Do 7 wellbeing quests in 7 days to restore your mental energy.',
   'wellbeing', 7, 7),
  ('ch-career-sprint', 'Career Sprint',
   'Power through 10 career quests in 14 days to accelerate your growth.',
   'career', 10, 14)
on conflict (id) do nothing;

-- Note: quests seed is large (~100 rows). Run separately:
-- psql $DATABASE_URL < supabase/seeds/quests.sql
