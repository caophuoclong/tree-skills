-- ============================================================
-- Migration 004: Fix & Complete skill_nodes seed
--
-- Migration 003 inserted nodes with incorrect IDs for softskills
-- (soft_t1_1) and wellbeing (well_t1_1). This migration:
--   1. Removes the incorrectly-namespaced nodes (cascades to
--      user_skill_nodes so no orphan rows remain).
--   2. Upserts the full canonical set matching the app's
--      src/business-logic/data/skill-tree-nodes.ts exactly.
-- ============================================================

-- ─── Remove incorrectly-named nodes from migration 003 ────────────────────────
delete from skill_nodes
where node_id in (
  'soft_t1_1','soft_t1_2','soft_t2_1','soft_t2_2','soft_t3_1',
  'well_t1_1','well_t1_2','well_t2_1','well_t2_2','well_t3_1'
);

-- ─── Upsert full canonical skill_nodes ────────────────────────────────────────
-- sort_order: branch offset (career=0, finance=100, softskills=200, wellbeing=300)
--             + tier offset (t1=0, t2=30, t3=60)
--             + node index within tier (×10)
insert into skill_nodes (node_id, branch, tier, title, description, xp_required, quests_total, sort_order) values

  -- ─── CAREER ──────────────────────────────────────────────────────────────────
  ('career_t1_1', 'career', 1,
   'Khám phá nghề nghiệp',
   'Hiểu rõ thế mạnh và định hướng nghề nghiệp phù hợp',
   50, 5, 10),

  ('career_t1_2', 'career', 1,
   'Xây dựng CV chuyên nghiệp',
   'Tạo hồ sơ ấn tượng thu hút nhà tuyển dụng',
   75, 5, 20),

  ('career_t2_1', 'career', 2,
   'Kỹ năng phỏng vấn',
   'Tự tin trả lời mọi câu hỏi phỏng vấn và gây ấn tượng tốt',
   100, 6, 30),

  ('career_t2_2', 'career', 2,
   'Networking chuyên nghiệp',
   'Xây dựng mạng lưới quan hệ trong ngành',
   120, 6, 40),

  ('career_t2_3', 'career', 2,
   'LinkedIn & Personal Brand',
   'Xây dựng thương hiệu cá nhân trên mạng xã hội chuyên nghiệp',
   100, 5, 50),

  ('career_t3_1', 'career', 3,
   'Lãnh đạo nhóm',
   'Phát triển kỹ năng quản lý và lãnh đạo đội nhóm hiệu quả',
   200, 7, 60),

  ('career_t3_2', 'career', 3,
   'Chiến lược sự nghiệp dài hạn',
   'Lập kế hoạch 5 năm và định hướng phát triển bền vững',
   250, 7, 70),

  ('career_t3_3', 'career', 3,
   'Kỹ năng đàm phán lương',
   'Tối đa hóa thu nhập và phúc lợi trong đàm phán',
   200, 6, 80),

  -- ─── FINANCE ─────────────────────────────────────────────────────────────────
  ('finance_t1_1', 'finance', 1,
   'Ngân sách cá nhân',
   'Lập và tuân thủ ngân sách hàng tháng hiệu quả',
   50, 5, 110),

  ('finance_t1_2', 'finance', 1,
   'Quỹ khẩn cấp',
   'Xây dựng quỹ dự phòng tài chính 3–6 tháng chi phí',
   75, 5, 120),

  ('finance_t2_1', 'finance', 2,
   'Đầu tư cơ bản',
   'Hiểu chứng khoán, quỹ ETF và bắt đầu đầu tư nhỏ',
   120, 6, 130),

  ('finance_t2_2', 'finance', 2,
   'Trả nợ thông minh',
   'Chiến lược trả hết nợ nhanh nhất và tiết kiệm lãi suất',
   100, 5, 140),

  ('finance_t3_1', 'finance', 3,
   'Đầu tư nâng cao',
   'Xây dựng danh mục đầu tư đa dạng và dòng thu nhập thụ động',
   200, 7, 150),

  ('finance_t3_2', 'finance', 3,
   'Tự do tài chính',
   'Lập kế hoạch FIRE và đạt được độc lập tài chính',
   250, 8, 160),

  ('finance_t3_3', 'finance', 3,
   'Kinh doanh & Thu nhập phụ',
   'Tạo nguồn thu nhập bổ sung thông qua kinh doanh nhỏ',
   200, 7, 170),

  -- ─── SOFTSKILLS ──────────────────────────────────────────────────────────────
  ('softskills_t1_1', 'softskills', 1,
   'Giao tiếp hiệu quả',
   'Truyền đạt ý kiến rõ ràng, súc tích trong công việc và cuộc sống',
   50, 5, 210),

  ('softskills_t1_2', 'softskills', 1,
   'Lắng nghe chủ động',
   'Phát triển khả năng lắng nghe sâu và thấu hiểu người khác',
   60, 5, 220),

  ('softskills_t2_1', 'softskills', 2,
   'Thuyết trình & Public Speaking',
   'Tự tin nói trước đám đông và thuyết phục người nghe',
   120, 6, 230),

  ('softskills_t2_2', 'softskills', 2,
   'Trí tuệ cảm xúc (EQ)',
   'Nhận biết và điều tiết cảm xúc trong các tình huống căng thẳng',
   100, 6, 240),

  ('softskills_t2_3', 'softskills', 2,
   'Giải quyết xung đột',
   'Xử lý mâu thuẫn một cách xây dựng và chuyên nghiệp',
   110, 5, 250),

  ('softskills_t3_1', 'softskills', 3,
   'Kỹ năng đàm phán',
   'Thương lượng để đạt kết quả win-win trong mọi tình huống',
   200, 7, 260),

  ('softskills_t3_2', 'softskills', 3,
   'Xây dựng quan hệ tin cậy',
   'Tạo và duy trì mối quan hệ bền vững, chân thành',
   180, 6, 270),

  -- ─── WELLBEING ───────────────────────────────────────────────────────────────
  ('wellbeing_t1_1', 'wellbeing', 1,
   'Giấc ngủ chất lượng',
   'Thiết lập thói quen ngủ đủ giấc và phục hồi năng lượng',
   40, 5, 310),

  ('wellbeing_t1_2', 'wellbeing', 1,
   'Vận động mỗi ngày',
   'Duy trì thói quen tập thể dục đơn giản nhưng đều đặn',
   50, 5, 320),

  ('wellbeing_t2_1', 'wellbeing', 2,
   'Quản lý stress',
   'Nhận diện và giảm thiểu các tác nhân gây căng thẳng',
   100, 6, 330),

  ('wellbeing_t2_2', 'wellbeing', 2,
   'Mindfulness & Thiền định',
   'Thực hành chánh niệm để cải thiện tập trung và bình an nội tâm',
   120, 6, 340),

  ('wellbeing_t3_1', 'wellbeing', 3,
   'Phục hồi cảm xúc (Resilience)',
   'Phát triển sức bền tâm lý và khả năng phục hồi sau thất bại',
   200, 7, 350),

  ('wellbeing_t3_2', 'wellbeing', 3,
   'Sống trọn vẹn & Tự thương',
   'Thực hành tự yêu thương và sống có ý nghĩa mỗi ngày',
   200, 6, 360)

on conflict (node_id) do update set
  title        = excluded.title,
  description  = excluded.description,
  xp_required  = excluded.xp_required,
  quests_total = excluded.quests_total,
  sort_order   = excluded.sort_order;
