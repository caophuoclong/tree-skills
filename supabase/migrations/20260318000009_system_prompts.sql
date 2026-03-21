-- ============================================================
-- Migration 009: System Prompts for AI Content Generation
--
-- Stores prompts used by external AI service to generate
-- personalized skills, quests, and challenges per user.
--
-- NO client-side CRUD — managed by external admin/generation service only.
-- ============================================================

-- ─── Table ────────────────────────────────────────────────────────────────────

create table system_prompts (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,                    -- e.g. 'skill_generation', 'quest_generation', 'challenge_generation'
  version       int not null default 1,           -- version tracking
  description   text not null default '',          -- human-readable description
  prompt        text not null,                     -- the actual prompt template
  variables     jsonb not null default '[]',       -- list of variable placeholders e.g. ["user_level", "branch", "streak"]
  is_active     boolean not null default true,     -- only active prompts are used
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (name, version)
);

create index system_prompts_name_active on system_prompts (name, is_active);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table system_prompts enable row level security;

-- No client-side access — managed by external service only
-- The external service uses service_role key which bypasses RLS

-- Deny all for anon/authenticated roles
create policy "No public access to system prompts"
  on system_prompts for all
  using (false);

-- ─── Trigger ──────────────────────────────────────────────────────────────────

create trigger system_prompts_updated_at
  before update on system_prompts
  for each row execute procedure set_updated_at();

-- ─── Seed: Default Prompts ────────────────────────────────────────────────────

insert into system_prompts (name, version, description, prompt, variables) values

  -- Skill Tree Generation
  ('skill_generation', 1, 'Generate personalized skill tree nodes based on user profile',
   'Bạn là một chuyên gia phát triển bản thân. Dựa vào thông tin người dùng sau, hãy tạo một cây kỹ năng cá nhân hóa:

**Thông tin người dùng:**
- Cấp độ hiện tại: {{user_level}}
- Nhánh chính: {{primary_branch}}
- Điểm mạnh theo nhánh: {{branch_weights}}
- Chuỗi ngày hoạt động: {{streak}} ngày
- Kỹ năng đã hoàn thành: {{completed_nodes}}

**Yêu cầu:**
1. Tạo 5-10 nodes kỹ năng mới phù hợp với trình độ hiện tại
2. Mỗi node phải có: node_id, branch, tier (1-3), title, description, xp_required, quests_total
3. Nodes phải theo thứ tự từ dễ đến khó
4. Tập trung vào nhánh chính và các nhánh liên quan
5. Mô tả phải cụ thể, actionable bằng tiếng Việt

**Định dạng output:** JSON array',
   '["user_level", "primary_branch", "branch_weights", "streak", "completed_nodes"]'),

  -- Quest Generation
  ('quest_generation', 1, 'Generate daily quests based on user stamina and branch',
   'Bạn là một huấn luyện viên phát triển bản thân. Hãy tạo danh sách nhiệm vụ hàng ngày:

**Thông tin người dùng:**
- Nhánh: {{branch}}
- Năng lượng hiện tại: {{stamina}}%
- Cấp độ: {{level}}
- Kỹ năng đang học: {{current_node}}
- Nhiệm vụ đã hoàn thành gần đây: {{recent_quests}}

**Yêu cầu:**
1. Tạo 3-5 nhiệm vụ phù hợp với năng lượng hiện tại
2. Mỗi nhiệm vụ: quest_id, title, description, difficulty (easy/medium/hard), duration_min (5/15/30), xp_reward (10/25/50)
3. Nhiệm vụ easy (5 phút) khi năng lượng thấp, hard (30 phút) khi năng lượng cao
4. XP thưởng proportional với độ khó và thời gian
5. Nội dung phải thực tế, có thể làm ngay

**Định dạng output:** JSON array',
   '["branch", "stamina", "level", "current_node", "recent_quests"]'),

  -- Challenge Generation
  ('challenge_generation', 1, 'Generate weekly challenges based on user progress',
   'Bạn là người thiết kế thử thách. Hãy tạo các thử thách tuần/tháng:

**Thông tin người dùng:**
- Nhánh chính: {{primary_branch}}
- Cấp độ: {{level}}
- Thử thách đã hoàn thành: {{completed_challenges}}
- Điểm yếu cần cải thiện: {{weak_areas}}

**Yêu cầu:**
1. Tạo 2-3 thử thách mới
2. Mỗi thử thách: id, title, description, branch, target_count, duration_days
3. Thử thách phải có mức độ khó tăng dần
4. Phần thưởng phải hấp dẫn (XP bonus, unlock nodes)
5. Mô tả bằng tiếng Việt, rõ ràng và truyền cảm hứng

**Định dạng output:** JSON array',
   '["primary_branch", "level", "completed_challenges", "weak_areas"]'),

  -- Assessment Analysis
  ('assessment_analysis', 1, 'Analyze assessment answers to determine user profile',
   'Bạn là chuyên gia phân tích tâm lý và phát triển bản thân. Hãy phân tích câu trả lời đánh giá:

**Câu trả lời:**
{{answers}}

**Yêu cầu:**
1. Tính điểm cho mỗi nhánh: career, finance, softskills, wellbeing
2. Xác định nhánh chính (primary_branch)
3. Đề xuất lộ trình học tập 3 tháng
4. Gợi ý nodes đầu tiên nên bắt đầu

**Định dạng output:**
{
  "branch_weights": {"career": X, "finance": X, "softskills": X, "wellbeing": X},
  "primary_branch": "branch_name",
  "roadmap_summary": "string",
  "recommended_start_nodes": ["node_id", ...]
}',
   '["answers"]'),

  -- Progress Feedback
  ('progress_feedback', 1, 'Generate personalized feedback based on weekly progress',
   'Bạn là người cố vấn phát triển bản thân. Hãy tạo phản hồi tuần cho người dùng:

**Dữ liệu tuần:**
- Nhiệm vụ hoàn thành: {{quests_completed}}/{{quests_total}}
- XP kiếm được: {{xp_earned}}
- Chuỗi ngày: {{streak}} ngày
- Nhánh đã học: {{branches_progress}}
- Năng lượng trung bình: {{avg_stamina}}%

**Yêu cầu:**
1. Đánh giá tổng quan tuần (tích cực/motivating)
2. Điểm nổi bật cần khen ngợi
3. Điểm cần cải thiện (nếu có)
4. Mục tiêu tuần tới
5. Lời khuyên cụ thể để cải thiện

**Định dạng:** Markdown text, tiếng Việt, tối đa 200 từ',
   '["quests_completed", "quests_total", "xp_earned", "streak", "branches_progress", "avg_stamina"]')

on conflict (name, version) do nothing;
