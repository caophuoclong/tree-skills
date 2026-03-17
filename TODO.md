# TODO — Life Skill Tree (Cây Kỹ Năng Cuộc Sống)

> **Ref:** PRD v1.0 · MVP_FEATURE_SCOPE · TECHNICAL_ARCHITECTURE · Stitch Design `projects/7641792071217503464`
> **Stack:** React Native (Expo) · Tamagui · Expo Router · Zustand · TanStack Query · Supabase
> **Design Theme:** Dark · Primary `#7C6AF7` · Font: Be Vietnam Pro · Roundness: 12px

---

## Legend
- `[ ]` — Not started
- `[x]` — Completed
- `[~]` — In progress
- `[-]` — Deferred / P1+

---

## Phase 0 — Project Setup & Foundation

### 0.1 Project Structure Cleanup
- [ ] Xóa màn hình mặc định Expo (tabs/index, tabs/explore)
- [ ] Tạo folder structure theo TECHNICAL_ARCHITECTURE:
  ```
  src/
  ├── business-logic/
  │   ├── hooks/
  │   ├── services/
  │   ├── stores/
  │   ├── api/
  │   └── types/
  └── ui/
      ├── components/
      ├── screens/
      └── navigation/
  ```
- [ ] Config TypeScript paths alias (`@/`)
- [ ] Setup Tamagui provider + tokens (colors, spacing, radius)
- [ ] Setup Be Vietnam Pro font via `expo-font`
- [ ] Setup Dark theme as default (colorMode: dark)
- [ ] Define design tokens: `#7C6AF7`, `#4DA8FF`, `#34D399`, `#FBBF24`, `#F472B6`, `#0D0D0F`

### 0.2 Navigation Setup
- [ ] Setup Expo Router với layout chuẩn:
  - `app/_layout.tsx` — Root layout (Tamagui + auth gate)
  - `app/(auth)/` — Onboarding + auth screens (no tab bar)
  - `app/(tabs)/` — Main app (bottom tab bar: Home, Tree, Quests, Profile)
  - `app/quest/[id].tsx` — Quest details modal
  - `app/branch/[id].tsx` — Branch detail screen
- [ ] Bottom tab bar: Home, Skill Tree, Quests, Profile icons

### 0.3 State Management Setup
- [ ] Setup Zustand stores:
  - `userStore` — auth state, user profile, level, XP, streak, stamina
  - `questStore` — daily quests, completion state
  - `skillTreeStore` — branches, nodes, unlock status
  - `onboardingStore` — MCQ answers, onboarding state
- [ ] Setup TanStack Query client + Axios instance
- [ ] Setup Supabase client (auth + database)

### 0.4 Auth Setup (Supabase)
- [ ] Cấu hình Supabase project
- [ ] Email + mật khẩu auth
- [ ] Google OAuth
- [ ] Apple Sign-In (bắt buộc cho iOS)
- [ ] JWT refresh token logic
- [ ] Auth guard cho protected routes

---

## Phase 1 — P0 Features (MVP v1.0)

---

### 1.1 Onboarding Flow
**Ref:** PRD §2.1 · Stitch: "Welcome to Life Skill Tree", "Goal Assessment Question", "Skill Tree Reveal Moment"

#### Screens
- [ ] **Welcome Screen** (`app/(auth)/welcome.tsx`)
  - Dark background với radial gradient `#6969f7` 15% opacity tại 50% / 40%
  - Headline: "Grow your skills. Level up your life."
  - Social proof: "Join 10,000+ Gen Z building real skills"
  - CTA: "Get Started" button (primary, full-width)
  - Link: "I already have an account" (secondary)
  - account_tree icon làm logo

- [ ] **Assessment Screen** (`app/(auth)/assessment.tsx`)
  - 10 câu MCQ, mỗi câu 1 màn hình riêng
  - Progress bar hiển thị "Câu X/10"
  - 4 lựa chọn mỗi câu (map với 4 nhánh)
  - Nút "Quay lại" câu trước
  - Nút "Bỏ qua" hiển thị ở câu đầu tiên → redirect Home
  - Câu hỏi stored trong `src/business-logic/data/assessment-questions.ts`

- [ ] **Skill Tree Generating Screen** (`app/(auth)/generating.tsx`)
  - Animation "Skill Tree đang được tạo..." (2–3 giây)
  - Loading spinner / lottie animation
  - Rule-based processing: map MCQ answers → branch weights

- [ ] **Skill Tree Reveal Screen** (`app/(auth)/reveal.tsx`)
  - Stitch: "Skill Tree Reveal Moment"
  - Animation 4 nhánh xuất hiện từ hạt giống nở thành cây
  - Hiển thị tên 4 nhánh: Career / Finance / Soft Skills / Wellbeing
  - CTA: "Bắt đầu hành trình" → Home Dashboard

#### Business Logic
- [ ] `assessment-questions.ts` — 10 câu MCQ + mapping logic
- [ ] `useOnboarding` hook — quản lý state MCQ, submit answers
- [ ] Rule-based skill tree generator: MCQ answers → `skill_tree_config`
- [ ] Persist `onboarding_answers` + `skill_tree_config` + `onboarded_at` vào Supabase

---

### 1.2 Home Dashboard
**Ref:** PRD §2.2, §2.4, §2.5 · Stitch: "Life Skill Tree Home Dashboard"

#### Screen (`app/(tabs)/index.tsx`)
- [ ] **Header Section**
  - Avatar + tên user (ví dụ: "Khang Nguyen")
  - Subtitle: title / class theo level
  - Notification icon + Settings icon
- [ ] **Stats Row**
  - 🔥 Streak counter (số ngày)
  - Mental Energy / Stamina %
  - Số pending quests
  - XP progress: `current/next_level` (ví dụ: 1,240/1,500)
- [ ] **Skill Branch Progress Bars**
  - 4 thanh progress: Career / Finance / Soft Skills / Wellbeing
  - Màu tương ứng: `#4DA8FF` / `#34D399` / `#FBBF24` / `#F472B6`
  - % hoàn thành mỗi nhánh
- [ ] **Stamina Bar** (prominent)
  - Xanh lá (70–100%) / Vàng (30–69%) / Đỏ (<30%)
  - Pulse animation khi vàng, shake animation khi đỏ
- [ ] **Suggested Quest Card**
  - Hiển thị 1 quest gợi ý nổi bật (ví dụ: "Networking" → +50 XP)
  - CTA: "Bắt đầu ngay"
- [ ] **Bottom Navigation Bar**
  - Home / Tree / Quests / Profile

---

### 1.3 Skill Tree — Core UI
**Ref:** PRD §2.2 · Stitch: "Life Skill Tree Home Dashboard", "Life Skill Tree Branch View"

#### Screens
- [ ] **Skill Tree Overview Screen** (`app/(tabs)/tree.tsx`)
  - Tab bar: Career / Finance / Soft Skills / Mental Health
  - Hiển thị active branch theo tab đang chọn
  - Free tier chỉ thấy 2 nhánh (Career + Wellbeing mặc định)

- [ ] **Branch View** (`app/branch/[id].tsx`)
  - Stitch: "Life Skill Tree Branch View"
  - Header: tên nhánh + search + notifications
  - Vertical skill tree với 3 tầng: Beginner / Intermediate / Advanced
  - Connector lines giữa các nodes (absolute positioning)
  - Node cards:
    - **Locked**: opacity 40%, lock icon, dark gray `#282839`
    - **In Progress**: glow border + pulse animation, màu nhánh
    - **Completed**: solid fill + checkmark, màu nhánh
  - Tap In Progress → Quest list của node đó
  - Tap Locked → Tooltip "Cần X XP để mở khóa"
  - Glassmorphism cards với backdrop blur

#### Business Logic
- [ ] `skillTreeStore` — 4 nhánh, mỗi nhánh 5–8 nodes, 3 tầng
- [ ] Node state machine: `locked → in_progress → completed`
- [ ] `useSkillTree` hook — fetch, unlock logic
- [ ] Seed data: 4 branches × 5–8 nodes = 20–32 nodes

#### Node Data Structure
```ts
type SkillNode = {
  node_id: string
  branch: 'career' | 'finance' | 'softskills' | 'wellbeing'
  tier: 1 | 2 | 3  // Beginner / Intermediate / Advanced
  title: string
  description: string
  status: 'locked' | 'in_progress' | 'completed'
  xp_required: number
  quests_total: number
  quests_completed: number
}
```

---

### 1.4 Daily Quests
**Ref:** PRD §2.3 · Stitch: "Daily Quests & Challenges Screen"

#### Screens
- [ ] **Daily Quests Screen** (`app/(tabs)/quests.tsx`)
  - Header: avatar + tên + "Thợ Săn Kỹ Năng" + coin counter
  - Level indicator: `LVL X` + "+2%"
  - Skill points: `X SP` + "+Y hôm nay"
  - Section "Daily Quests": refreshes countdown (ví dụ: "Refreshes in 4 hours")
  - **Quest Cards** (3 free / 5 premium):
    - Title (tiếng Việt)
    - Branch color tag
    - Duration tag (5/15/30 phút)
    - XP reward badge (+10/+25/+50 XP)
    - Checkbox completion
  - Section "Special Challenges": HOT EVENT banner
  - Section: Leaderboard preview

- [ ] **Quest Detail Screen** (`app/quest/[id].tsx`)
  - Stitch: "Quest Details: Career Branch"
  - Full quest description
  - Branch context
  - XP reward breakdown
  - CTA: "Hoàn thành Quest" button
  - Back navigation

#### Quest Completion Interaction
- [ ] Checkbox tap → spring animation + vibration (expo-haptics)
- [ ] XP count-up animation sau completion
- [ ] Strikethrough + opacity giảm cho quest đã xong
- [ ] Quests không thể untick sau khi xong
- [ ] Quest reset lúc 00:00 GMT+7

#### Business Logic
- [ ] `questStore` — daily quests state, completion tracking
- [ ] `useQuestManager` hook — fetch daily, complete quest
- [ ] `QuestService` — rule-based assignment từ quest library
- [ ] Quest library: `src/business-logic/data/quest-library.ts`
  - ~200 quests tiếng Việt, 4 nhánh, 3 độ khó
  - Easy 10 XP / Medium 25 XP / Hard 50 XP
- [ ] POST `/quests/:id/complete` → server tính XP + Stamina update

---

### 1.5 XP & Stamina System
**Ref:** PRD §2.4

#### Business Logic
- [ ] `useXPEngine` hook:
  - XP per quest: Easy +10 / Medium +25 / Hard +50
  - Level thresholds: 100 / 250 / 500 / 1000 / +500/level
  - Level-up trigger → modal
- [ ] `useStaminaSystem` hook:
  - Wellbeing quest completed → +15 Stamina (max 100)
  - 0 Wellbeing quests today → -10/ngày
  - ≥3 Career/Finance, 0 Wellbeing → -20/ngày (grinding penalty)
  - Debuff: Stamina <30% → Career/Finance XP -50%
  - Hard gate: Stamina = 0% → chỉ thấy Wellbeing quests

#### UI Components
- [ ] `XPCountUpAnimation` — count-up số XP sau completion
- [ ] `StaminaBar` component — màu động theo ngưỡng + animations
- [ ] **Level Up Modal** (`components/ui/level-up-modal.tsx`)
  - Stitch: "Level Up Celebration Screen"
  - Confetti / celebration animation
  - Hiển thị level mới + unlocked features
  - CTA: "Tiếp tục"

---

### 1.6 Growth Streak
**Ref:** PRD §2.5 · Stitch: "Leaderboard of Persistence"

#### UI Components
- [ ] `StreakCounter` component — 🔥 icon + số ngày, nổi bật trên Home
- [ ] `StreakMilestoneToast` — micro-interaction khi hoàn thành quest đầu ngày
- [ ] Streak milestone badges: 7 / 14 / 30 / 60 / 100 ngày

#### Business Logic
- [ ] `useGrowthStreak` hook:
  - Streak +1 khi ≥1 quest xong trước 23:59 GMT+7
  - Streak reset về 0 nếu bỏ 1 ngày
  - Không có grace period ở v1
  - Milestone tracking: 7, 14, 30, 60, 100

#### Leaderboard Screen
- [ ] **Leaderboard Screen** (`app/leaderboard.tsx`)
  - Stitch: "Leaderboard of Persistence"
  - Danh sách người dùng + streak + XP
  - Highlight hạng của bản thân
  - *Note: không có public leaderboard ở v1 theo PRD — có thể là friend/guild only*

---

### 1.7 Authentication & Profile
**Ref:** PRD §2.6 · Stitch: "User Profile & Statistics Screen"

#### Screens
- [ ] **Login Screen** (`app/(auth)/login.tsx`)
  - Email + password
  - Google OAuth button
  - Apple Sign-In button (bắt buộc iOS)
  - Link: "Chưa có tài khoản? Đăng ký"

- [ ] **Register Screen** (`app/(auth)/register.tsx`)
  - Email + password
  - Google OAuth
  - Apple Sign-In
  - Validation với Zod

- [ ] **Profile Screen** (`app/(tabs)/profile.tsx`)
  - Stitch: "User Profile & Statistics Screen"
  - Avatar + tên + level badge
  - Stats grid:
    - Tổng XP
    - Streak hiện tại + Best streak
    - Số quests hoàn thành
    - Số ngày hoạt động
    - Số nhánh active
  - 4 thanh progress nhánh kỹ năng
  - Stamina history (minimal)
  - Settings link

---

## Phase 1.5 — Data & API Layer

### API Layer
- [ ] Setup Supabase schema (PostgreSQL):
  - `users` table — profile + stats
  - `skill_nodes` table — 4 branches × nodes
  - `user_nodes` table — user progress per node
  - `quests` table — quest library (~200 quests)
  - `daily_quest_assignments` table — user × date × quests
  - `quest_completions` table — completion log
  - `user_progress` table — XP, level, streak, stamina per day
- [ ] Seed quest library (200 quests tiếng Việt)
- [ ] Seed skill tree nodes (4 branches × 5–8 nodes)
- [ ] API endpoints (Fastify backend):
  - `POST /auth/login`
  - `GET /users/:id/skill-tree`
  - `GET /quests/daily`
  - `POST /quests/:id/complete`
  - `GET /users/:id/progress`
  - `POST /users/:id/mood-checkin`
- [ ] Cron job: Stamina decay lúc 23:59 GMT+7
- [ ] Cron job: Quest reset lúc 00:00 GMT+7

---

## Phase 2 — P1 Features (v1.1 — Tháng 4–6)

### 2.1 Freemium Gate (RevenueCat)
- [-] Setup RevenueCat iOS + Android
- [-] Free tier: 2 nhánh / 3 quests/ngày
- [-] Premium (99k VND/tháng): 4 nhánh / 5 quests / Streak Shield
- [-] Intro offer: 99k/3 tháng đầu
- [-] Paywall screen

### 2.2 Progress Analytics
- [-] XP chart theo tuần (bar chart)
- [-] % hoàn thành mỗi nhánh
- [-] Calendar heatmap streak history
- [-] So sánh tuần này vs tuần trước

### 2.3 Push Notifications (Expo Notifications)
- [-] Streak reminder lúc 20:00 nếu chưa có quest hôm nay
- [-] Stamina cảnh báo khi <30%
- [-] Streak milestone notification (7, 14, 30, 60, 100 ngày)
- [-] Weekly summary (Thứ Hai sáng)
- [-] Wellbeing hotline banner (trigger 3 ngày "rất tệ" liên tiếp)

---

## Phase 3 — P2 Features (v2.0 — Tháng 7+)

- [-] Mentor Unlock System (Level 5+)
- [-] Guild System (5–10 người, weekly challenge)
- [-] AI Personalization (NLP mood analysis, burnout detection)
- [-] Chat UI / AI Companion

---

## Reusable UI Components Cần Build

- [ ] `GlassmorphismCard` — backdrop blur, subtle border
- [ ] `ProgressBar` — animated, color-coded
- [ ] `QuestCard` — branch tag, duration, XP, checkbox
- [ ] `SkillNode` — locked/in-progress/completed states + glow
- [ ] `BranchConnector` — SVG lines between nodes
- [ ] `StaminaBar` — dynamic color + animations
- [ ] `StreakBadge` — 🔥 + count
- [ ] `XPBadge` — XP reward indicator
- [ ] `LevelBadge` — level chip
- [ ] `BranchTab` — color-coded tab for branch switching
- [ ] `AvatarWithLevel` — user avatar + level overlay
- [ ] `LevelUpModal` — celebration overlay
- [ ] `XPCountUp` — animated number count-up
- [ ] `CheckboxWithSpring` — animated quest checkbox

---

## Design System Tokens

```ts
// Colors
career:     '#4DA8FF'  // blue
finance:    '#34D399'  // teal
softskills: '#FBBF24'  // amber
wellbeing:  '#F472B6'  // pink
primary:    '#7C6AF7'  // purple
bg:         '#0D0D0F'  // dark bg
card:       'rgba(30, 30, 38, 0.6)'  // glassmorphism

// Stamina states
stamina.high:   '#22c55e'  // green   (70-100%)
stamina.medium: '#eab308'  // yellow  (30-69%)
stamina.low:    '#ef4444'  // red     (<30%)

// Radius
radius.sm: 8px
radius.md: 12px
radius.lg: 16px
radius.xl: 24px
```

---

## Stitch Design Screens → App Screen Mapping

| Stitch Screen | App Route | Status |
|---|---|---|
| Welcome to Life Skill Tree | `app/(auth)/welcome.tsx` | `[ ]` |
| Goal Assessment Question | `app/(auth)/assessment.tsx` | `[ ]` |
| Skill Tree Reveal Moment | `app/(auth)/reveal.tsx` | `[ ]` |
| Life Skill Tree Home Dashboard | `app/(tabs)/index.tsx` | `[ ]` |
| Life Skill Tree Branch View | `app/(tabs)/tree.tsx` + `app/branch/[id].tsx` | `[ ]` |
| Daily Quests & Challenges Screen | `app/(tabs)/quests.tsx` | `[ ]` |
| Quest Details: Career Branch | `app/quest/[id].tsx` | `[ ]` |
| Level Up Celebration Screen | `components/ui/level-up-modal.tsx` | `[ ]` |
| Leaderboard of Persistence | `app/leaderboard.tsx` | `[ ]` |
| User Profile & Statistics Screen | `app/(tabs)/profile.tsx` | `[ ]` |

---

## MVP Delivery Checklist (từ PRD)

- [ ] Onboarding flow (10 câu MCQ → Skill Tree reveal)
- [ ] 4-nhánh Skill Tree UI (locked / in-progress / completed)
- [ ] Thư viện 200 quests (AI-generated + human-reviewed, tiếng Việt)
- [ ] Daily quest assignment (rule-based, reset 00:00 GMT+7)
- [ ] XP system + level-up animation
- [ ] Stamina bar + decay/recovery cron job (23:59 GMT+7)
- [ ] Growth Streak counter + milestone notifications
- [ ] Auth (Email + Google + Apple Sign-In)
- [ ] Basic profile page
- [ ] Wellbeing disclaimer + hotline redirect (trigger 3 ngày liên tiếp)
- [ ] Push notification (streak reminder lúc 20:00)
- [ ] RevenueCat: 99k/3 tháng intro → 99k/tháng

---

*Tài liệu này được generate từ: PRD_LifeSkillTree.md · MVP_FEATURE_SCOPE.md · TECHNICAL_ARCHITECTURE.md · Stitch Design `projects/7641792071217503464`*
*Cập nhật: 2026-03-17*
