# Life Skills — Database ERD

## Tables Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    AUTH (Supabase)                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  auth.users                                                                │   │
│  │  ─────────────────────────────────────────────────────────────────────────  │   │
│  │  id                    uuid (PK)                                           │   │
│  │  email                 text                                                 │   │
│  │  encrypted_password    text                                                 │   │
│  │  raw_user_meta_data    jsonb                                                │   │
│  │  created_at            timestamptz                                          │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Tables

### profiles (1:1 with auth.users)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  profiles                                                                           │
│  ─────────────────────────────────────────────────────────────────────────────────  │
│  id                    uuid (PK, FK → auth.users.id) ON DELETE CASCADE              │
│  name                  text NOT NULL DEFAULT 'Người Dùng'                           │
│  avatar_url            text                                                          │
│  level                 int NOT NULL DEFAULT 1                                        │
│  total_xp              int NOT NULL DEFAULT 0                                        │
│  current_xp_in_level   int NOT NULL DEFAULT 0                                        │
│  xp_to_next_level      int NOT NULL DEFAULT 100                                      │
│  streak                int NOT NULL DEFAULT 0                                        │
│  best_streak           int NOT NULL DEFAULT 0                                        │
│  stamina               int NOT NULL DEFAULT 100 CHECK (0..100)                       │
│  primary_branch        branch_type (NULL)                                            │
│  onboarding_done       boolean NOT NULL DEFAULT false                                │
│  last_active_date      date                                                          │
│  shields_remaining     int NOT NULL DEFAULT 2 CHECK (0..2)                           │
│  shield_activated_date date                                                          │
│  created_at            timestamptz NOT NULL DEFAULT now()                            │
│  updated_at            timestamptz NOT NULL DEFAULT now()                            │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

### skill_nodes (Master Catalog)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  skill_nodes                                                                        │
│  ─────────────────────────────────────────────────────────────────────────────────  │
│  node_id       text (PK)             e.g. 'career_t1_1'                             │
│  branch        branch_type NOT NULL                                                 │
│  tier          int NOT NULL CHECK (1..3)                                            │
│  title         text NOT NULL                                                        │
│  description   text NOT NULL DEFAULT ''                                             │
│  xp_required   int NOT NULL DEFAULT 50                                              │
│  quests_total  int NOT NULL DEFAULT 5                                               │
│  sort_order    int NOT NULL DEFAULT 0                                               │
│  created_at    timestamptz NOT NULL DEFAULT now()                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### user_skill_nodes (User Progress per Node)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  user_skill_nodes                                                                   │
│  ─────────────────────────────────────────────────────────────────────────────────  │
│  id               uuid (PK) DEFAULT gen_random_uuid()                               │
│  user_id          uuid (FK → auth.users.id) ON DELETE CASCADE                       │
│  node_id          text (FK → skill_nodes.node_id) ON DELETE CASCADE                 │
│  status           node_status NOT NULL DEFAULT 'locked'                             │
│  quests_completed int NOT NULL DEFAULT 0                                            │
│  unlocked_at      timestamptz                                                       │
│  completed_at     timestamptz                                                       │
│  created_at       timestamptz NOT NULL DEFAULT now()                                │
│  UNIQUE (user_id, node_id)                                                          │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

### quests (Master Catalog)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  quests                                                                             │
│  ─────────────────────────────────────────────────────────────────────────────────  │
│  quest_id     text (PK)               e.g. 'career_easy_001'                        │
│  title        text NOT NULL                                                          │
│  description  text NOT NULL DEFAULT ''                                               │
│  branch       branch_type NOT NULL                                                   │
│  difficulty   difficulty_type NOT NULL                                               │
│  duration_min int NOT NULL CHECK (5, 15, 30)                                         │
│  xp_reward    int NOT NULL CHECK (10, 25, 50)                                        │
│  node_id      text (FK → skill_nodes.node_id) NULL                                   │
│  created_at   timestamptz NOT NULL DEFAULT now()                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### user_quests (Completed Quests)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  user_quests                                                                        │
│  ─────────────────────────────────────────────────────────────────────────────────  │
│  id           uuid (PK) DEFAULT gen_random_uuid()                                   │
│  user_id      uuid (FK → auth.users.id) ON DELETE CASCADE                           │
│  quest_id     text (FK → quests.quest_id)                                           │
│  completed_at timestamptz NOT NULL DEFAULT now()                                     │
│  xp_earned    int NOT NULL                                                          │
│  date         date NOT NULL DEFAULT current_date                                     │
│                                                                              INDEX: │
│  user_quests_user_date (user_id, date)                                              │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

### challenges (Master Catalog)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  challenges                                                                         │
│  ─────────────────────────────────────────────────────────────────────────────────  │
│  id            text (PK)                                                            │
│  title         text NOT NULL                                                        │
│  description   text NOT NULL DEFAULT ''                                             │
│  branch        branch_type NOT NULL                                                 │
│  target_count  int NOT NULL                                                         │
│  duration_days int NOT NULL                                                         │
│  created_at    timestamptz NOT NULL DEFAULT now()                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### user_challenges (User Participation)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  user_challenges                                                                    │
│  ─────────────────────────────────────────────────────────────────────────────────  │
│  id           uuid (PK) DEFAULT gen_random_uuid()                                   │
│  user_id      uuid (FK → auth.users.id) ON DELETE CASCADE                           │
│  challenge_id text (FK → challenges.id)                                             │
│  progress     int NOT NULL DEFAULT 0                                                │
│  joined_at    timestamptz NOT NULL DEFAULT now()                                     │
│  ends_at      timestamptz NOT NULL                                                   │
│  completed_at timestamptz NULL                                                      │
│  UNIQUE (user_id, challenge_id)                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

### daily_bonuses (Login Rewards)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  daily_bonuses                                                                      │
│  ─────────────────────────────────────────────────────────────────────────────────  │
│  id          uuid (PK) DEFAULT gen_random_uuid()                                    │
│  user_id     uuid (FK → auth.users.id) ON DELETE CASCADE                            │
│  bonus_date  date NOT NULL DEFAULT current_date                                      │
│  xp_earned   int NOT NULL                                                           │
│  streak_day  int NOT NULL DEFAULT 1                                                 │
│  created_at  timestamptz NOT NULL DEFAULT now()                                     │
│  UNIQUE (user_id, bonus_date)                                                       │
│                                                                              INDEX: │
│  daily_bonuses_user_date (user_id, bonus_date)                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

### roadmap_milestones

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  roadmap_milestones                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────────  │
│  id           uuid (PK) DEFAULT gen_random_uuid()                                   │
│  user_id      uuid (FK → auth.users.id) ON DELETE CASCADE                           │
│  title        text NOT NULL                                                         │
│  branch       branch_type NOT NULL                                                  │
│  horizon      time_horizon NOT NULL                                                 │
│  target_date  date NOT NULL                                                         │
│  is_completed boolean NOT NULL DEFAULT false                                        │
│  created_at   timestamptz NOT NULL DEFAULT now()                                    │
│  updated_at   timestamptz NOT NULL DEFAULT now()                                    │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

### custom_goal_trees

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  custom_goal_trees                                                                  │
│  ─────────────────────────────────────────────────────────────────────────────────  │
│  id         uuid (PK) DEFAULT gen_random_uuid()                                     │
│  user_id    uuid (FK → auth.users.id) ON DELETE CASCADE                             │
│  goal       text NOT NULL                                                           │
│  clusters   jsonb NOT NULL DEFAULT '[]'                                             │
│  created_at timestamptz NOT NULL DEFAULT now()                                      │
│  updated_at timestamptz NOT NULL DEFAULT now()                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

### notifications

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  notifications                                                                      │
│  ─────────────────────────────────────────────────────────────────────────────────  │
│  id         uuid (PK) DEFAULT gen_random_uuid()                                     │
│  user_id    uuid (FK → auth.users.id) ON DELETE CASCADE                             │
│  type       notif_type NOT NULL                                                     │
│  title      text NOT NULL                                                           │
│  body       text NOT NULL DEFAULT ''                                                │
│  is_read    boolean NOT NULL DEFAULT false                                          │
│  created_at timestamptz NOT NULL DEFAULT now()                                      │
│                                                                              INDEX: │
│  notifications_user_unread (user_id, is_read)                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Reference Tables (Public Read)

### branches

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  branches                                                                           │
│  ─────────────────────────────────────────────────────────────────────────────────  │
│  id         branch_type (PK)                                                        │
│  label      text NOT NULL             Vietnamese display label                      │
│  label_en   text NOT NULL             Short English name                            │
│  color      text NOT NULL             Hex accent color  e.g. '#7C6AF7'              │
│  emoji      text NOT NULL             Single emoji  e.g. '💼'                       │
│  icon       text NOT NULL             Ionicons name  e.g. 'briefcase'               │
│  sort_order int NOT NULL DEFAULT 0                                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### assessment_questions

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  assessment_questions                                                               │
│  ─────────────────────────────────────────────────────────────────────────────────  │
│  id         serial (PK)                                                             │
│  question   text NOT NULL                                                           │
│  sort_order int NOT NULL DEFAULT 0                                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### assessment_options

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  assessment_options                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────────  │
│  id          text (PK)                  e.g. '1a', '1b', ...                         │
│  question_id int (FK → assessment_questions.id) ON DELETE CASCADE                    │
│  text        text NOT NULL                                                          │
│  branch      branch_type NOT NULL                                                   │
│  sort_order  int NOT NULL DEFAULT 0                                                 │
│                                                                              INDEX: │
│  assessment_options_question_id (question_id, sort_order)                           │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Enums

| Enum Name | Values |
|-----------|--------|
| `branch_type` | `career`, `finance`, `softskills`, `wellbeing` |
| `node_status` | `locked`, `in_progress`, `completed` |
| `difficulty_type` | `easy`, `medium`, `hard` |
| `time_horizon` | `short`, `mid`, `long` |
| `notif_type` | `streak_reminder`, `quest_suggestion`, `level_up`, `challenge_complete`, `wellbeing_warning` |

---

## Relationships

```
auth.users
    │
    ├─── 1:1 ─── profiles
    │
    ├─── 1:N ─── user_skill_nodes ─── N:1 ─── skill_nodes
    │
    ├─── 1:N ─── user_quests ─────────N:1 ─── quests ──── N:1 ─── skill_nodes
    │
    ├─── 1:N ─── user_challenges ──── N:1 ─── challenges
    │
    ├─── 1:N ─── daily_bonuses
    │
    ├─── 1:N ─── roadmap_milestones
    │
    ├─── 1:N ─── custom_goal_trees
    │
    └─── 1:N ─── notifications

assessment_questions
    │
    └─── 1:N ─── assessment_options

branches (standalone reference table)
```

---

## RLS Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | own | trigger only | own | — |
| `skill_nodes` | anyone | — | — | — |
| `user_skill_nodes` | own | own | own | — |
| `quests` | anyone | — | — | — |
| `user_quests` | own | own | — | — |
| `challenges` | anyone | — | — | — |
| `user_challenges` | own | own | own | own |
| `daily_bonuses` | own | own | — | — |
| `roadmap_milestones` | own | own | own | own |
| `custom_goal_trees` | own | own | own | own |
| `notifications` | own | service_role | own | own |
| `branches` | anyone | — | — | — |
| `assessment_questions` | anyone | — | — | — |
| `assessment_options` | anyone | — | — | — |

---

## Triggers

| Trigger | Table | Event | Action |
|---------|-------|-------|--------|
| `on_auth_user_created` | `auth.users` | AFTER INSERT | Auto-create profile row |
| `profiles_updated_at` | `profiles` | BEFORE UPDATE | Set `updated_at = now()` |
| `roadmap_milestones_updated_at` | `roadmap_milestones` | BEFORE UPDATE | Set `updated_at = now()` |
| `custom_goal_trees_updated_at` | `custom_goal_trees` | BEFORE UPDATE | Set `updated_at = now()` |
