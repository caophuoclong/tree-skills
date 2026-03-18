-- ============================================================
-- Migration 006: Assessment tables, RLS & seed
--
-- assessment_questions  — 10 onboarding questions
-- assessment_options    — 4 options per question (40 rows)
--
-- Both tables are publicly readable (anon role) because the
-- assessment flow happens before the user authenticates.
-- ============================================================

-- ─── Tables ───────────────────────────────────────────────────────────────────

create table assessment_questions (
  id         serial primary key,
  question   text not null,
  sort_order int  not null default 0
);

create table assessment_options (
  id            text primary key,          -- e.g. '1a', '1b', ...
  question_id   int  not null references assessment_questions(id) on delete cascade,
  text          text not null,
  branch        branch_type not null,
  sort_order    int  not null default 0
);

create index assessment_options_question_id on assessment_options (question_id, sort_order);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table assessment_questions enable row level security;
alter table assessment_options   enable row level security;

create policy "Anyone can read assessment questions"
  on assessment_questions for select using (true);

create policy "Anyone can read assessment options"
  on assessment_options for select using (true);

-- ─── Seed: questions ──────────────────────────────────────────────────────────

insert into assessment_questions (id, question, sort_order) values
  (1,  'Điều bạn muốn cải thiện nhất trong cuộc sống hiện tại là gì?',                10),
  (2,  'Vào cuối ngày làm việc, điều gì thường khiến bạn cảm thấy chưa hài lòng?',    20),
  (3,  'Nếu có 30 phút rảnh mỗi ngày, bạn muốn dùng để làm gì?',                      30),
  (4,  'Bạn đang đối mặt với thách thức nào lớn nhất?',                               40),
  (5,  'Thành tựu nào sẽ khiến bạn tự hào nhất sau 1 năm nữa?',                       50),
  (6,  'Điều gì cản trở bạn nhiều nhất hiện nay?',                                    60),
  (7,  'Bạn học tốt nhất theo cách nào?',                                              70),
  (8,  'Bạn nghĩ phần nào của bản thân cần được nâng cấp ngay?',                      80),
  (9,  'Bạn muốn được nhớ đến nhờ điều gì trong 5 năm tới?',                          90),
  (10, 'Khi gặp khó khăn, bạn thường phản ứng như thế nào?',                          100)
on conflict (id) do nothing;

-- Manually set sequence to avoid collision on future inserts
select setval(pg_get_serial_sequence('assessment_questions', 'id'), 10, true);

-- ─── Seed: options ────────────────────────────────────────────────────────────

insert into assessment_options (id, question_id, text, branch, sort_order) values
  -- Q1
  ('1a', 1, 'Thăng tiến trong sự nghiệp và tìm công việc tốt hơn',    'career',     1),
  ('1b', 1, 'Quản lý tài chính và tiết kiệm nhiều hơn',               'finance',    2),
  ('1c', 1, 'Giao tiếp tốt hơn và xây dựng mối quan hệ',             'softskills', 3),
  ('1d', 1, 'Cân bằng cảm xúc và giảm stress trong cuộc sống',       'wellbeing',  4),

  -- Q2
  ('2a', 2, 'Chưa hoàn thành đủ công việc quan trọng',               'career',     1),
  ('2b', 2, 'Đã tiêu quá nhiều tiền không cần thiết',                'finance',    2),
  ('2c', 2, 'Chưa nói chuyện đủ rõ ràng với đồng nghiệp hoặc bạn bè','softskills', 3),
  ('2d', 2, 'Cảm thấy mệt mỏi và kiệt sức về tinh thần',            'wellbeing',  4),

  -- Q3
  ('3a', 3, 'Học thêm kỹ năng chuyên môn hoặc đọc sách nghề nghiệp', 'career',     1),
  ('3b', 3, 'Nghiên cứu đầu tư và lập kế hoạch tài chính',          'finance',    2),
  ('3c', 3, 'Tham gia cộng đồng hoặc kết nối với người mới',         'softskills', 3),
  ('3d', 3, 'Thiền định, tập yoga hoặc đi dạo thư giãn',             'wellbeing',  4),

  -- Q4
  ('4a', 4, 'Không biết định hướng nghề nghiệp rõ ràng',             'career',     1),
  ('4b', 4, 'Không kiểm soát được chi tiêu và nợ nần',               'finance',    2),
  ('4c', 4, 'Khó khăn trong việc trình bày ý kiến trước đám đông',   'softskills', 3),
  ('4d', 4, 'Hay lo lắng, mất ngủ và thiếu năng lượng',             'wellbeing',  4),

  -- Q5
  ('5a', 5, 'Được thăng chức hoặc chuyển sang công việc mơ ước',     'career',     1),
  ('5b', 5, 'Tiết kiệm được số tiền đủ cho quỹ khẩn cấp 6 tháng',   'finance',    2),
  ('5c', 5, 'Tự tin thuyết trình trước 100 người',                    'softskills', 3),
  ('5d', 5, 'Duy trì thói quen sống lành mạnh và hạnh phúc mỗi ngày','wellbeing',  4),

  -- Q6
  ('6a', 6, 'Thiếu kinh nghiệm và bằng cấp cần thiết',               'career',     1),
  ('6b', 6, 'Không biết cách đầu tư và tăng thu nhập thụ động',       'finance',    2),
  ('6c', 6, 'Ngại ngùng, thiếu tự tin khi giao tiếp xã hội',         'softskills', 3),
  ('6d', 6, 'Sức khoẻ tinh thần không ổn định và hay burnout',       'wellbeing',  4),

  -- Q7
  ('7a', 7, 'Thực hành dự án thực tế và xây dựng portfolio',         'career',     1),
  ('7b', 7, 'Phân tích số liệu và theo dõi kết quả tài chính',       'finance',    2),
  ('7c', 7, 'Tham gia hội thảo và luyện tập cùng người khác',        'softskills', 3),
  ('7d', 7, 'Thực hành mindfulness và tự quan sát cảm xúc',          'wellbeing',  4),

  -- Q8
  ('8a', 8, 'Kỹ năng kỹ thuật và chuyên môn trong lĩnh vực',         'career',     1),
  ('8b', 8, 'Tư duy về tiền bạc và thói quen tài chính',             'finance',    2),
  ('8c', 8, 'Khả năng lắng nghe và đồng cảm với người khác',         'softskills', 3),
  ('8d', 8, 'Khả năng phục hồi cảm xúc khi gặp khó khăn',           'wellbeing',  4),

  -- Q9
  ('9a', 9, 'Là người chuyên nghiệp và giỏi trong lĩnh vực của mình','career',     1),
  ('9b', 9, 'Là người tự chủ tài chính và thông minh trong đầu tư',  'finance',    2),
  ('9c', 9, 'Là người có khả năng kết nối và truyền cảm hứng',       'softskills', 3),
  ('9d', 9, 'Là người cân bằng, bình an và sống trọn vẹn từng ngày', 'wellbeing',  4),

  -- Q10
  ('10a', 10, 'Tìm kiếm mentor hoặc học thêm để giải quyết vấn đề',  'career',     1),
  ('10b', 10, 'Xem xét lại ngân sách và tìm cách cắt giảm chi phí',  'finance',    2),
  ('10c', 10, 'Nhờ bạn bè tư vấn và tìm kiếm sự hỗ trợ từ cộng đồng','softskills', 3),
  ('10d', 10, 'Dừng lại, hít thở sâu và cho bản thân thời gian phục hồi','wellbeing', 4)

on conflict (id) do nothing;
