# Onboarding Migration Guide

## 1. Persona & Expertise

You are an expert PostgreSQL Database Architect specializing in Supabase. You write secure, scalable, and highly optimized migration scripts. You strictly follow instructions and respect existing database architectures.

## 2. App Context

**Life Skills** is a gamified personal development mobile app (React Native/Expo) for Generation Z. It features a "Skill Tree" system that balances career growth, financial literacy, soft skills, and mental wellbeing.

The app has an **Onboarding Assessment Flow** where users answer questions so the AI can generate their personalized skill tree and learning roadmap.

## 3. Existing Database State (CRITICAL)

The database ALREADY CONTAINS the following tables. **DO NOT create, alter, or drop them:**

| Table | Description |
|-------|-------------|
| `auth.users` | Supabase default authentication |
| `profiles` | User profiles (extends auth.users 1:1) |
| `skill_nodes` | Master catalog of skill tree nodes |
| `user_skill_nodes` | User progress per skill node |
| `quests` | Master catalog of quests |
| `user_quests` | Completed quest records |
| `challenges` | Master catalog of challenges |
| `user_challenges` | User challenge participation |
| `roadmap_milestones` | User long-term milestones |
| `custom_goal_trees` | AI-generated personalized skill trees |
| `notifications` | User notifications |
| `branches` | Branch metadata (career, finance, softskills, wellbeing) |
| `assessment_questions` | Onboarding assessment questions |
| `assessment_options` | Onboarding assessment options (4 per question) |
| `daily_bonuses` | Daily login reward records |
| `system_prompts` | AI generation prompts (admin-managed) |
| `ai_providers` | AI provider configurations |
| `master_data` | Unified config table (type/key/data) |
| `daily_bonuses` | Daily login bonus records |

### Key enums (already exist):
- `branch_type`: career, finance, softskills, wellbeing
- `node_status`: locked, in_progress, completed
- `difficulty_type`: easy, medium, hard
- `time_horizon`: short, mid, long
- `notif_type`: streak_reminder, quest_suggestion, level_up, challenge_complete, wellbeing_warning

## 4. Objective

Write a PostgreSQL migration script for the Onboarding requirements. The script should have two steps:

### STEP 1: Seed Onboarding Options into `master_data`

Use `master_data` table (NOT `masterdata`). Insert predefined onboarding choices:

```sql
insert into master_data (type, key, data, description, sort_order) values
  ('career_stage', '...', '{"label": "..."}', '...', sort_order);
```

**Required categories and values:**

| Type | Values |
|------|--------|
| `career_stage` | University Freshman/Sophomore, University Junior/Senior, Lost Fresher, Working Professional |
| `priority_goal` | Find Career Direction, Upskill Professionally, Improve Mental Health, Financial Independence |
| `pain_point` | Peer Pressure, Burnout, Lack of Direction, Financial Stress |
| `content_format` | Short Videos, Podcasts, Quick Reading |
| `mbti_type` | All 16 MBTI types (INTJ, ENFP, INTP, ENTJ, INFJ, ENFJ, INFP, ENTP, ISTJ, ESTJ, ISFJ, ESFJ, ISTP, ESTP, ISFP, ESFP) |

### STEP 2: Create `user_onboardings` Table

Create table to store user onboarding responses:

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default gen_random_uuid() |
| `user_id` | uuid | FK → auth.users(id) ON DELETE CASCADE |
| `career_stage_id` | uuid | FK → master_data(id) |
| `priority_goal_id` | uuid | FK → master_data(id) |
| `pain_point_id` | uuid | FK → master_data(id) |
| `content_format_id` | uuid | FK → master_data(id) |
| `mbti_type_id` | uuid | FK → master_data(id), nullable |
| `stamina_baseline` | int | CHECK (1..10) |
| `created_at` | timestamptz | default now() |
| `updated_at` | timestamptz | default now() |

## 5. Supabase SQL Guidelines

- Write Postgres-compatible SQL (lowercase keywords)
- Include header comment explaining the migration
- Add inline comments for inserts and table creation
- Add trigger for `updated_at` auto-update (reuse existing `set_updated_at()` function)
- Enable RLS on `user_onboardings` with policies:
  - Users can SELECT own onboarding
  - Users can INSERT own onboarding
  - Users can UPDATE own onboarding
- Use `on conflict (type, key) do nothing` for idempotent inserts
- Use existing `set_updated_at()` trigger function (already exists)

## 6. Output Format

Output ONLY raw, executable SQL code. No markdown code blocks. No conversational filler.
