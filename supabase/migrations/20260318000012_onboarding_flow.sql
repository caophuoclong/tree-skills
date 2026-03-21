-- ============================================================
-- Migration 012: Onboarding Flow
--
-- Seeds onboarding options into master_data and creates
-- user_onboardings table to store user responses.
-- ============================================================

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 1: Seed Onboarding Options into master_data
-- ═══════════════════════════════════════════════════════════════════════════════

-- Career Stage
insert into master_data (type, key, data, description, sort_order) values
  ('career_stage', 'uni_freshman',    '{"label": "Sinh viên năm 1-2", "label_en": "University Freshman/Sophomore", "icon": "📚"}', 'Đang học đại học năm 1-2', 1),
  ('career_stage', 'uni_junior',      '{"label": "Sinh viên năm 3-4", "label_en": "University Junior/Senior", "icon": "🎓"}', 'Đang học đại học năm 3-4', 2),
  ('career_stage', 'lost_fresher',    '{"label": "Mới ra trường", "label_en": "Lost Fresher", "icon": "🤔"}', 'Tốt nghiệp nhưng chưa có định hướng', 3),
  ('career_stage', 'working_pro',     '{"label": "Đi làm rồi", "label_en": "Working Professional", "icon": "💼"}', 'Đã đi làm, muốn phát triển thêm', 4)
on conflict (type, key) do nothing;

-- Priority Goal
insert into master_data (type, key, data, description, sort_order) values
  ('priority_goal', 'find_direction',  '{"label": "Tìm định hướng nghề nghiệp", "label_en": "Find Career Direction", "icon": "🧭"}', 'Khám phá và xác định hướng đi phù hợp', 1),
  ('priority_goal', 'upskill',         '{"label": "Nâng cao kỹ năng chuyên môn", "label_en": "Upskill Professionally", "icon": "📈"}', 'Phát triển kỹ năng để thăng tiến', 2),
  ('priority_goal', 'mental_health',   '{"label": "Cải thiện sức khỏe tinh thần", "label_en": "Improve Mental Health", "icon": "🧘"}', 'Quản lý stress và cân bằng cuộc sống', 3),
  ('priority_goal', 'financial_free',  '{"label": "Tự do tài chính", "label_en": "Financial Independence", "icon": "💰"}', 'Xây dựng nền tảng tài chính vững chắc', 4)
on conflict (type, key) do nothing;

-- Pain Point
insert into master_data (type, key, data, description, sort_order) values
  ('pain_point', 'peer_pressure',   '{"label": "Áp lực từ bạn bè", "label_en": "Peer Pressure", "icon": "👥"}', 'Cảm thấy thua kém so với bạn bè cùng trang lứa', 1),
  ('pain_point', 'burnout',         '{"label": "Kiệt sức (Burnout)", "label_en": "Burnout", "icon": "😫"}', 'Mệt mỏi, không còn động lực làm việc', 2),
  ('pain_point', 'no_direction',    '{"label": "Không biết mình muốn gì", "label_en": "Lack of Direction", "icon": "🤷"}', 'Mơ hồ về tương lai, không có mục tiêu rõ ràng', 3),
  ('pain_point', 'money_stress',    '{"label": "Áp lực tài chính", "label_en": "Financial Stress", "icon": "💸"}', 'Lo lắng về tiền bạc và chi tiêu', 4)
on conflict (type, key) do nothing;

-- Content Format
insert into master_data (type, key, data, description, sort_order) values
  ('content_format', 'videos',   '{"label": "Video ngắn", "label_en": "Short Videos", "icon": "🎬"}', 'Nội dung dạng video 3-5 phút', 1),
  ('content_format', 'podcasts', '{"label": "Podcast", "label_en": "Podcasts", "icon": "🎧"}', 'Nghe audio khi di chuyển', 2),
  ('content_format', 'reading',  '{"label": "Đọc nhanh", "label_en": "Quick Reading", "icon": "📖"}', 'Bài viết ngắn, dễ đọc', 3)
on conflict (type, key) do nothing;

-- MBTI Types
insert into master_data (type, key, data, description, sort_order) values
  ('mbti_type', 'intj', '{"label": "INTJ", "name": "Nhà Chiến Lược", "desc": "Tư duy logic, độc lập, có tầm nhìn xa"}', 'The Architect', 1),
  ('mbti_type', 'intp', '{"label": "INTP", "name": "Nhà Tư Duy", "desc": "Sáng tạo, tò mò, thích phân tích"}', 'The Logician', 2),
  ('mbti_type', 'entj', '{"label": "ENTJ", "name": "Nhà Lãnh Đạo", "desc": "Quyết đoán, có khả năng lãnh đạo tự nhiên"}', 'The Commander', 3),
  ('mbti_type', 'entp', '{"label": "ENTP", "name": "Người Thảo Luận", "desc": "Nhanh trí, thích tranh luận và thử thách"}', 'The Debater', 4),
  ('mbti_type', 'infj', '{"label": "INFJ", "name": "Nhà Cố Vấn", "desc": "Nhạy cảm, có tầm nhìn và khả năng thấu hiểu"}', 'The Advocate', 5),
  ('mbti_type', 'infp', '{"label": "INFP", "name": "Người Hòa Giải", "desc": "Lý tưởng hóa, sáng tạo, giàu lòng trắc ẩn"}', 'The Mediator', 6),
  ('mbti_type', 'enfj', '{"label": "ENFJ", "name": "Người Truyền Cảm Hứng", "desc": "Nhiệt tình, có khả năng lãnh đạo và truyền cảm hứng"}', 'The Protagonist', 7),
  ('mbti_type', 'enfp', '{"label": "ENFP", "name": "Nhà Hoạt Động", "desc": "Nhiệt tình, sáng tạo, giao tiếp tốt"}', 'The Campaigner', 8),
  ('mbti_type', 'istj', '{"label": "ISTJ", "name": "Người Quản Lý", "desc": "Có trách nhiệm, thực tế, đáng tin cậy"}', 'The Logistician', 9),
  ('mbti_type', 'isfj', '{"label": "ISFJ", "name": "Người Bảo Vệ", "desc": "Chu đáo, tận tụy, bảo vệ người khác"}', 'The Defender', 10),
  ('mbti_type', 'estj', '{"label": "ESTJ", "name": "Nhà Điều Hành", "desc": "Tổ chức tốt, có khả năng quản lý"}', 'The Executive', 11),
  ('mbti_type', 'esfj', '{"label": "ESFJ", "name": "Người Tư Vấn", "desc": "Hòa đồng, quan tâm đến người khác"}', 'The Consul', 12),
  ('mbti_type', 'istp', '{"label": "ISTP", "name": "Nhà Thợ Thủ Công", "desc": "Linh hoạt, thực tế, giỏi giải quyết vấn đề"}', 'The Virtuoso', 13),
  ('mbti_type', 'isfp', '{"label": "ISFP", "name": "Nghệ Sĩ", "desc": "Nghệ thuật, nhạy cảm, thích tự do"}', 'The Adventurer', 14),
  ('mbti_type', 'estp', '{"label": "ESTP", "name": "Doanh Nhân", "desc": "Năng động, thích mạo hiểm, hành động nhanh"}', 'The Entrepreneur', 15),
  ('mbti_type', 'esfp', '{"label": "ESFP", "name": "Người Trình Diễn", "desc": "Nhiệt tình, vui vẻ, thích giao tiếp"}', 'The Entertainer', 16)
on conflict (type, key) do nothing;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2: Create user_onboardings Table
-- ═══════════════════════════════════════════════════════════════════════════════

create table user_onboardings (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  career_stage_id   uuid references master_data(id),
  priority_goal_id  uuid references master_data(id),
  pain_point_id     uuid references master_data(id),
  content_format_id uuid references master_data(id),
  mbti_type_id      uuid references master_data(id),
  stamina_baseline  int check (stamina_baseline between 1 and 10),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (user_id)
);

create index user_onboardings_user on user_onboardings (user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════════════════════════════

alter table user_onboardings enable row level security;

create policy "Users can view own onboarding"
  on user_onboardings for select
  using (auth.uid() = user_id);

create policy "Users can insert own onboarding"
  on user_onboardings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own onboarding"
  on user_onboardings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- Trigger for updated_at
-- ═══════════════════════════════════════════════════════════════════════════════

create trigger user_onboardings_updated_at
  before update on user_onboardings
  for each row execute procedure set_updated_at();
