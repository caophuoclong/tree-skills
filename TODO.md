# TODO — Life Skill Tree (Cây Kỹ Năng Cuộc Sống)

> **Nguồn tài liệu:** `PRD_LifeSkillTree.md` · `MVP_FEATURE_SCOPE.md` · `TECHNICAL_ARCHITECTURE.md` · `DESIGN_SYSTEM.md` · `PROMPT_DESIGN.md`
> **Stitch Design:** `projects/7641792071217503464`
> **Stack:** React Native (Expo SDK) · Tamagui · Expo Router · Zustand · TanStack Query · Supabase

---

## Legend

```
[ ] Chưa làm
[x] Hoàn thành
[~] Đang làm
[-] Defer (P1/P2 — chưa cần cho MVP)
```

---

## Phase 0 — Foundation & Architecture

> Không skip phase này. Mọi thứ phía sau phụ thuộc vào nền móng này.

### 0.1 Project Restructure

- [ ] Xóa màn hình Expo mặc định: `app/(tabs)/index.tsx`, `app/(tabs)/explore.tsx`, `app/modal.tsx`
- [ ] Xóa default components: `components/hello-wave.tsx`, `components/parallax-scroll-view.tsx`, `components/themed-*.tsx`, `components/external-link.tsx`
- [ ] Tạo folder structure theo `TECHNICAL_ARCHITECTURE.md`:

```
src/
├── business-logic/
│   ├── hooks/              ← useQuestManager, useXPEngine, useStaminaSystem, useGrowthStreak…
│   ├── services/           ← QuestService, UserService, SkillTreeService, NotificationService
│   ├── stores/             ← Zustand: userStore, questStore, skillTreeStore, onboardingStore
│   ├── api/                ← axios client, TanStack Query config, endpoint functions
│   ├── data/               ← quest-library.ts, assessment-questions.ts, skill-tree-nodes.ts
│   └── types/              ← TypeScript interfaces & enums (Branch, NodeStatus, Quest…)
│
└── ui/
    ├── atoms/              ← Button, Text, Icon, Badge, ProgressBar, Checkbox, Avatar
    ├── molecules/          ← QuestCard, SkillNode, StaminaBar, XPProgressBar, StreakBadge, BentoCard, MoodWidget
    ├── organisms/          ← HomeGrid, SkillTreeBranch, QuestList, LevelUpModal, OnboardingStep
    ├── templates/          ← AuthLayout, TabLayout, ModalLayout
    └── screens/            ← (tham chiếu từ app/ — không chứa logic)
```

- [ ] Setup TypeScript path alias `@/` → `src/`
- [ ] Cấu hình `tsconfig.json` paths

### 0.2 Tamagui Setup

- [ ] Cài thêm packages: `@tamagui/config`, `@tamagui/animations-react-native`
- [ ] Tạo `src/ui/tokens/theme.ts` với toàn bộ design tokens từ `DESIGN_SYSTEM.md`:

**Colors:**
```ts
bgBase:        '#0D0D0F'   // nền chính (18:00–06:00)
bgBaseDayMode: '#121214'   // nền sáng hơn (06:00–18:00) — Adaptive Dark Mode
bgSurface:     '#161618'   // card, bottom sheet
bgElevated:    '#1E1E22'   // modal, overlay

brandPrimary:  '#7C6AF7'   // lavender
brandGlow:     '#A89BFA'   // highlight

career:        '#4DA8FF'   // Career/Tech
finance:       '#34D399'   // Finance
softskills:    '#FBBF24'   // Soft Skills
wellbeing:     '#F472B6'   // Mental Well-being

success:       '#34D399'
warning:       '#FBBF24'
danger:        '#F87171'
staminaOk:     '#34D399'   // ≥70%
staminaMid:    '#FBBF24'   // 30–69%
staminaLow:    '#F87171'   // <30%

textPrimary:   '#F4F4F5'
textSecondary: '#A1A1AA'
textMuted:     '#52525B'
```

**Glassmorphism:**
```ts
glassBg:     'rgba(255,255,255,0.05)'
glassBorder: 'rgba(255,255,255,0.08)'
glassBlur:   20    // BackdropFilter — BlurView intensity
glassShadow: '0 8px 32px rgba(0,0,0,0.4)'
```

**Spacing (base 4dp):**
```ts
xs: 4,  sm: 8,  md: 16,  lg: 24,  xl: 32,  '2xl': 48,  '3xl': 64
screenPadding: 20
cardGap: 12
sectionGap: 24
```

**Radius:**
```ts
sm: 8,  md: 12,  lg: 16,  xl: 24,  full: 9999
```

- [ ] Setup Tamagui Provider trong `app/_layout.tsx`
- [ ] Setup dark theme config trong Tamagui

### 0.3 Typography Setup

> **Quan trọng:** Font theo `DESIGN_SYSTEM.md` là 3 font riêng — KHÔNG phải Be Vietnam Pro

- [ ] Cài `expo-font` + load 3 font families:
  - `Clash Display` — headings, level names, XP counter (display-xl, display-lg)
  - `Inter` — body text (title, body-lg, body, caption, micro)
  - `JetBrains Mono` — số liệu, stats, code-style labels

- [ ] Tạo `src/ui/tokens/typography.ts`:
```ts
displayXL:  { fontFamily: 'ClashDisplay', fontSize: 32, fontWeight: 'bold' }   // splash, level-up
displayLG:  { fontFamily: 'ClashDisplay', fontSize: 24, fontWeight: '600' }    // section headers
title:      { fontFamily: 'Inter', fontSize: 20, fontWeight: '600' }            // card titles
bodyLG:     { fontFamily: 'Inter', fontSize: 16, fontWeight: '400' }            // body chính
body:       { fontFamily: 'Inter', fontSize: 14, fontWeight: '400' }            // secondary
caption:    { fontFamily: 'Inter', fontSize: 12, fontWeight: '400' }            // labels
micro:      { fontFamily: 'Inter', fontSize: 10, fontWeight: '500' }            // badges
statsMono:  { fontFamily: 'JetBrainsMono', fontSize: 14 }                       // stats numbers
```

### 0.4 Motion Constants

- [ ] Tạo `src/ui/tokens/motion.ts`:
```ts
spring: {
  bounce:  { type: 'spring', stiffness: 300, damping: 20 },
  smooth:  { type: 'spring', stiffness: 200, damping: 30 },
}
easing: {
  outCubic:  [0.33, 1, 0.68, 1],
  inOut:     [0.65, 0, 0.35, 1],
}
duration: {
  instant:   0,     // state changes
  fast:      150,   // micro feedback
  normal:    300,   // card transitions
  slow:      600,   // XP/progress fill
  cinematic: 800,   // level up, onboarding reveal
}
```

### 0.5 Adaptive Dark Mode

- [ ] Tạo `src/business-logic/hooks/useAdaptiveDark.ts`:
  - 06:00–18:00 → `bgBase: #121214` (slightly lighter)
  - 18:00–06:00 → `bgBase: #0D0D0F` (deeper dark)
  - Sử dụng `new Date().getHours()` + update mỗi giờ

### 0.6 Navigation Setup (Expo Router)

- [ ] Cấu trúc routes:
```
app/
├── _layout.tsx              ← Root: Tamagui provider + auth gate + adaptive theme
├── (auth)/
│   ├── _layout.tsx          ← Auth layout (no tab bar, no header)
│   ├── splash.tsx           ← Splash screen (logo animate-in, auto 2s)
│   ├── welcome.tsx          ← Hero + CTA
│   ├── login.tsx            ← Email/Google/Apple login
│   ├── register.tsx         ← Đăng ký
│   ├── assessment.tsx       ← 10 câu MCQ (state machine)
│   ├── generating.tsx       ← "Đang tạo Skill Tree..." loading
│   └── reveal.tsx           ← Skill Tree reveal animation
├── (tabs)/
│   ├── _layout.tsx          ← Bottom tab bar: Home, Tree, Quests, Profile
│   ├── index.tsx            ← Home Dashboard (Bento Grid)
│   ├── tree.tsx             ← Skill Tree Overview (4 tabs)
│   ├── quests.tsx           ← Daily Quests & Challenges
│   └── profile.tsx          ← User Profile & Stats
├── branch/[id].tsx          ← Branch Detail (skill nodes)
├── quest/[id].tsx           ← Quest Detail
├── leaderboard.tsx          ← Leaderboard
└── wellbeing.tsx            ← Mental Energy / Wellbeing module
```

- [ ] Bottom tab bar: Home / Tree / Quests / Profile
  - Active state: `brandPrimary #7C6AF7`
  - Inactive: `textMuted #52525B`
  - Tab bar background: `bgSurface #161618`

### 0.7 State Management Setup

- [ ] `src/business-logic/stores/userStore.ts` (Zustand):
  ```ts
  userId, name, avatar, level, totalXP, currentXPInLevel,
  streak, bestStreak, stamina, lastActiveDate, onboardingDone
  ```
- [ ] `src/business-logic/stores/questStore.ts`:
  ```ts
  dailyQuests[], completedToday[], lastResetDate
  ```
- [ ] `src/business-logic/stores/skillTreeStore.ts`:
  ```ts
  branches: { career, finance, softskills, wellbeing },
  nodes: SkillNode[],
  activeNodePerBranch: Record<Branch, string>
  ```
- [ ] `src/business-logic/stores/onboardingStore.ts`:
  ```ts
  currentQuestion, answers[10], treeConfig, skipped
  ```
- [ ] Setup TanStack Query Client + `QueryClientProvider`
- [ ] Setup Axios instance với base URL + JWT interceptor

### 0.8 Supabase Setup

- [ ] Cài `@supabase/supabase-js`
- [ ] Tạo `src/business-logic/api/supabase.ts` — client + env config
- [ ] Auth: Email/Password + Google OAuth + Apple Sign-In
- [ ] JWT refresh logic (auto-refresh token)
- [ ] Auth state listener → update `userStore`

---

## Phase 1 — Atomic Design: Atoms

> Các component nhỏ nhất, không phụ thuộc component khác.

### 1.1 `<Typography />` variants
- [ ] `<Display />` — ClashDisplay, dùng cho headings lớn
- [ ] `<Title />` — Inter SemiBold 20sp
- [ ] `<Body />` — Inter Regular 14–16sp
- [ ] `<Caption />` — Inter Regular 12sp
- [ ] `<MonoStat />` — JetBrains Mono, dùng cho số liệu

### 1.2 `<Button />`
- [ ] **Primary:** solid `brandPrimary`, pill shape (radius full), 56dp height, full-width
  - Pressed: scale 0.97 + color `#6A59E0`, spring-smooth
- [ ] **Secondary:** outline `brandPrimary`, transparent bg
- [ ] **Ghost:** text only, `textSecondary`
- [ ] **Danger:** bg `danger`
- [ ] Loading state: spinner replace label

### 1.3 `<Icon />`
- [ ] Wrapper cho `@expo/vector-icons` + custom SVG icons
- [ ] Size variants: sm(16) / md(20) / lg(24) / xl(32)

### 1.4 `<Avatar />`
- [ ] Circular image (expo-image)
- [ ] Size variants: sm(32) / md(48) / lg(80)
- [ ] Fallback: initials trên colored background

### 1.5 `<Badge />`
- [ ] XP badge: `+10 XP`, `+25 XP`, `+50 XP` — bg `brandPrimary`, micro font
- [ ] Branch tag: bg màu nhánh opacity 20%, text màu nhánh, micro font
- [ ] Duration tag: "5 min" / "15 min" / "30 min" — bg `bgSurface`, caption font
- [ ] Level badge: "LVL 4" — mono font, `brandPrimary`
- [ ] Streak milestone badge: "🔥 7 ngày" — warning color

### 1.6 `<ProgressBar />`
- [ ] Props: `value` (0–100), `color`, `animated`
- [ ] Spring-smooth fill animation khi value thay đổi
- [ ] Thin variant (4dp height) — dùng cho branch progress trên Profile
- [ ] Thick variant (8dp height) — dùng cho XP bar

### 1.7 `<Checkbox />`
- [ ] Unchecked: outline circle, `textMuted`
- [ ] Completed: filled circle `brandPrimary` + checkmark
- [ ] Animation: scale 1 → 1.3 → 1 + color fill, 300ms spring-bounce
- [ ] Haptic: `Haptics.impactAsync(LIGHT)` khi complete
- [ ] Disabled sau khi checked (không thể untick)

### 1.8 `<GlassView />`
- [ ] Wrapper dùng `BlurView` (expo) + glassmorphism tokens
- [ ] Props: `cols` (1|2|3 cho Bento), `children`
- [ ] `glass-bg`, `glass-border`, `glass-shadow`, `radius.lg`

---

## Phase 2 — Atomic Design: Molecules

> Tổ hợp từ atoms, có logic hiển thị riêng.

### 2.1 `<BentoCard />`
- [ ] Props: `cols: 1 | 2 | 3`, `children`, `onPress?`
- [ ] Width tính theo: `(screenWidth - 40) / 3 * cols + gap * (cols-1)`
- [ ] GlassView base, radius.lg, padding md
- [ ] Pressed: scale 0.97, duration fast

### 2.2 `<QuestCard />`
- [ ] Ref: `DESIGN_SYSTEM.md §6` + Stitch "Daily Quests & Challenges"
- [ ] GlassView base
- [ ] **Left border 4dp** màu accent theo branch (career/finance/softskills/wellbeing)
- [ ] Title: `<Title />`, white
- [ ] Row: `<Badge branch />` + `<Badge duration />` + `<Badge xp />` góc phải trên
- [ ] `<Checkbox />` bên phải
- [ ] Completed state: strikethrough title + opacity 0.5
- [ ] Completion animation: checkbox spring + row fade

### 2.3 `<SkillNode />`
- [ ] Ref: `DESIGN_SYSTEM.md §6`
- [ ] Props: `branch`, `status: 'locked'|'in-progress'|'completed'`, `level`, `label`
- [ ] **Locked:** opacity 0.4, lock icon overlay, `#282839` bg, no interaction
- [ ] **In-progress:** `brandPrimary` glow border + pulse animation (500ms loop), branch color accent
  - Glow: `box-shadow 0 0 15px brandPrimary` pulsing
- [ ] **Completed:** solid fill branch color + checkmark icon
- [ ] Tap In-progress → navigate to quest list của node
- [ ] Tap Locked → Tooltip "Cần X XP để mở khóa"
- [ ] Connector lines: thin SVG lines (dashed for locked paths, solid for unlocked)

### 2.4 `<StaminaBar />`
- [ ] Ref: `DESIGN_SYSTEM.md §6`
- [ ] Props: `value: number (0–100)`
- [ ] Màu động theo ngưỡng (smooth transition):
  - ≥70%: `staminaOk` (xanh lá)
  - 30–69%: `staminaMid` (vàng) + pulse nhẹ (400ms loop)
  - <30%: `staminaLow` (đỏ) + shake animation (400ms) + warning icon
- [ ] Label: "Mental Energy · {value}%"
- [ ] Haptic: `Haptics.notificationAsync(WARNING)` khi drop xuống <30%

### 2.5 `<XPProgressBar />`
- [ ] Ref: `DESIGN_SYSTEM.md §6`
- [ ] Props: `current`, `target`, `level`
- [ ] Label trái: "XP" ; Label phải: "Lv.{level}" (mono font)
- [ ] Progress: `current / target * 100%`
- [ ] Animated fill: spring-smooth 600ms khi XP thay đổi
- [ ] Level-up burst: particle effect khi đạt 100%

### 2.6 `<StreakBadge />`
- [ ] Ref: `DESIGN_SYSTEM.md §6`
- [ ] Props: `count: number`, `protected?: boolean`
- [ ] 🔥 icon + `<MonoStat count />` in bold
- [ ] count ≥ 7 → glow animation (warning color)
- [ ] `protected = true` → shield overlay nhỏ góc phải (Premium)
- [ ] Milestone animation: bounce + Haptics.impactAsync(MEDIUM)

### 2.7 `<MoodWidget />`
- [ ] Ref: `DESIGN_SYSTEM.md` Component Prompts + PRD §2.4 Business Rules
- [ ] 5 emoji tùy chọn ngang: 😔 😕 😐 🙂 😊
- [ ] Label: "How are you feeling today?"
- [ ] Selected: scale 1.3 + circle bg soft color
- [ ] Glass card, subtle `wellbeing` border
- [ ] Compact: fit trong BentoCard
- [ ] Submit → `POST /users/:id/mood-checkin`
- [ ] Trigger wellbeing hotline logic nếu 3 ngày liên tiếp chọn 😔

### 2.8 `<BranchConnectorLine />`
- [ ] SVG lines giữa SkillNodes trong Branch View
- [ ] Solid + branch color → cho unlocked path
- [ ] Dashed + `textMuted` → cho locked path

### 2.9 `<LevelBadge />`
- [ ] "LEVEL {n}" display, ClashDisplay font, `brandPrimary`
- [ ] Glow khi vừa level up

---

## Phase 3 — Atomic Design: Organisms

> Các section hoàn chỉnh, kết hợp nhiều molecules.

### 3.1 `<HomeGrid />` — Bento Grid Dashboard
- [ ] Ref: `DESIGN_SYSTEM.md §5` Bento Grid Layout
- [ ] Grid 3 cột, `(screenWidth - 40) / 3` mỗi cell, gap 12dp
- [ ] Layout:
  ```
  ┌──────────────────────┬────────────┐
  │  Skill Tree Progress │  Streak    │  ← BentoCard 2col | 1col
  │  4 branch rings      │  🔥 12     │
  │                      ├────────────┤
  │                      │  Stamina   │  ← 1col
  │                      │  ██████░░  │
  ├───────────┬──────────┴────────────┤
  │  Quests   │    XP Progress        │  ← 1col | 2col
  │  3 today  │  ▓▓▓▓▓▓░░  Lv4       │
  └───────────┴───────────────────────┘
  ```
- [ ] Mood widget card (optional — show nếu chưa check-in hôm nay)

### 3.2 `<SkillTreeBranch />` — Branch View Organism
- [ ] Header: branch name + màu + tab selector
- [ ] 3 tier sections: Beginner / Intermediate / Advanced
- [ ] Nodes trong mỗi tier theo chiều dọc
- [ ] SVG `<BranchConnectorLine />` giữa các nodes
- [ ] Current node glow radius
- [ ] Floating "Today's Quest" button anchored to active node

### 3.3 `<QuestList />` — Danh sách quests
- [ ] Header: "Today's Quests" + "{n}/{total} complete" progress
- [ ] Stamina mini-bar ở đầu (subtle)
- [ ] List `<QuestCard />` items
- [ ] Stamina = 0% hard gate: chỉ hiện Wellbeing quests + warning banner
- [ ] Empty state khi hết quests: icon + "No quests — check back tomorrow!"

### 3.4 `<LevelUpModal />` — Celebration Organism
- [ ] Ref: `DESIGN_SYSTEM.md §6` + Stitch "Level Up Celebration Screen"
- [ ] Full-screen overlay, `bgElevated`
- [ ] Radial particle burst (lavender/purple particles) — Reanimated
- [ ] "LEVEL UP!" ClashDisplay 32sp, glowing
- [ ] Sub: "You've reached Level {n}"
- [ ] Unlock reveal card: "🔓 New unlock: {reward}"
- [ ] XP summary: "You earned {n} XP this week"
- [ ] CTA: `<Button primary>Continue</Button>`
- [ ] Animation: cinematic 800ms
- [ ] Haptic: `Haptics.notificationAsync(SUCCESS)`
- [ ] Auto-dismiss sau 5s nếu không tap

### 3.5 `<OnboardingStep />` — Assessment step organism
- [ ] Progress bar top (thin, `brandPrimary`, "{n}/10")
- [ ] Question: `<Display />` font lớn
- [ ] 4 answer options: GlassView cards, full width
  - Unselected: `glassBg`, `glassBorder`
  - Selected: `brandPrimary` border + subtle bg tint
  - Auto-advance khi tap option (no "Next" button)
- [ ] "Quay lại" ghost button top-left (nếu không phải câu 1)
- [ ] "Bỏ qua" ghost button top-right (CHỈ câu 1) → skip về Home

### 3.6 `<WellbeingWarningBanner />`
- [ ] Kích hoạt khi Stamina <30%
- [ ] Gentle banner (không interrupt flow): "Bạn đang grinding — hãy nghỉ một chút 💙"
- [ ] Nếu mood "rất tệ" 3 ngày liên tiếp: thêm link đường dây hỗ trợ tâm lý Việt Nam
- [ ] Disclaimer text: *"Ứng dụng này không thay thế tư vấn tâm lý chuyên nghiệp."*

---

## Phase 4 — Screens

> Mỗi screen = 1 file trong `app/`. Chỉ compose organisms + molecules, không có business logic trực tiếp.

### 4.1 Onboarding Flow
**Ref:** PRD §2.1 · DESIGN_SYSTEM §7.1 · Stitch: Welcome, Goal Assessment, Skill Tree Reveal

#### `app/(auth)/splash.tsx`
- [ ] Logo animate-in (scale + opacity, cinematic 800ms)
- [ ] Tagline: "Cây Kỹ Năng Cuộc Sống"
- [ ] Radial gradient `brandPrimary` 15% opacity
- [ ] Auto-advance sau 2s → Welcome

#### `app/(auth)/welcome.tsx`
- [ ] Dark bg + radial gradient 50% / 40%
- [ ] Logo icon (account_tree)
- [ ] Headline: "Grow your skills. Level up your life." — `<Display />`
- [ ] Social proof: "Join 10,000+ Gen Z building real skills" — `<Caption />`
- [ ] `<Button primary>Get Started</Button>` → Login
- [ ] `<Button ghost>I already have an account</Button>` → Login

#### `app/(auth)/login.tsx`
- [ ] Email + password form (Zod validation)
- [ ] `<Button primary>Đăng nhập</Button>`
- [ ] Google OAuth button
- [ ] Apple Sign-In button (bắt buộc iOS)
- [ ] Link → Register

#### `app/(auth)/register.tsx`
- [ ] Email + password + confirm password (Zod)
- [ ] Google OAuth + Apple Sign-In
- [ ] Link → Login

#### `app/(auth)/assessment.tsx`
- [ ] State machine: question index 0–9
- [ ] Render `<OnboardingStep />` cho mỗi câu
- [ ] 10 câu MCQ trong `src/business-logic/data/assessment-questions.ts`
  - Mỗi đáp án map với 1 trong 4 branch (career/finance/softskills/wellbeing)
- [ ] Quay lại câu trước (back button)
- [ ] Submit câu cuối → `/assessment/generating`
- [ ] Persist `onboarding_answers` vào `onboardingStore`

#### `app/(auth)/generating.tsx`
- [ ] Lottie loading animation "Skill Tree đang được tạo..."
- [ ] Rule-based processor: MCQ answers → `skill_tree_config` (4 nhánh + weights)
- [ ] Thời gian: 2–3s (fake loading cho UX, xử lý thực trong <500ms)
- [ ] Auto-advance → Reveal

#### `app/(auth)/reveal.tsx`
- [ ] Ref: Stitch "Skill Tree Reveal Moment"
- [ ] Animation cây mọc từ hạt giống (Reanimated, cinematic)
- [ ] 4 nhánh xuất hiện lần lượt với branch colors
- [ ] CTA: "Bắt đầu hành trình" → Home Dashboard
- [ ] Set `onboarding_done = true` trong Supabase + `userStore`

---

### 4.2 Home Dashboard
**Ref:** PRD §2.2, §2.4, §2.5 · DESIGN_SYSTEM §7.2 · Stitch: "Life Skill Tree Home Dashboard"

#### `app/(tabs)/index.tsx`
- [ ] SafeAreaView + ScrollView
- [ ] **Header row:**
  - `<Avatar />` + tên user + subtitle (class/title theo level)
  - Notification icon + Settings icon (right)
- [ ] **`<HomeGrid />`** — Bento Grid (organism) với 5 cards:
  1. Skill Tree Progress (2col) — 4 branch circular rings
  2. Streak Badge (1col) — 🔥 + số ngày
  3. Stamina Card (1col) — `<StaminaBar />`
  4. Today's Quests (1col) — số quests + branch dots
  5. XP Progress (2col) — `<XPProgressBar />`
- [ ] Mood widget card (nếu chưa check-in hôm nay)
- [ ] `<WellbeingWarningBanner />` nếu Stamina <30%
- [ ] Navigate: tap Skill Tree card → `/(tabs)/tree`, tap Quest card → `/(tabs)/quests`

---

### 4.3 Skill Tree Screen
**Ref:** PRD §2.2 · DESIGN_SYSTEM §6 · Stitch: "Life Skill Tree Branch View"

#### `app/(tabs)/tree.tsx`
- [ ] Tab bar: Career / Finance / Soft Skills / Wellbeing (màu theo branch)
- [ ] Free tier: chỉ active 2 tabs (Career + Wellbeing mặc định); Finance + Soft Skills locked với premium badge
- [ ] Render `<SkillTreeBranch />` cho tab đang active

#### `app/branch/[id].tsx`
- [ ] Header: tên branch + màu + search icon
- [ ] `<SkillTreeBranch />` organism
- [ ] 3 tầng: Beginner / Intermediate / Advanced (labels)
- [ ] Nodes + connector lines
- [ ] Floating "Today's Quest" button anchored to active node
- [ ] Tap In-progress node → `app/quest/[id]?nodeId=X`
- [ ] Tap Locked node → Tooltip "Cần X XP để mở khóa"

---

### 4.4 Daily Quests Screen
**Ref:** PRD §2.3 · DESIGN_SYSTEM §7 · Stitch: "Daily Quests & Challenges"

#### `app/(tabs)/quests.tsx`
- [ ] Header: `<Avatar />` + tên + "Thợ Săn Kỹ Năng" + `<Badge xp />` counter
- [ ] Level indicator: `<LevelBadge />` + XP today trend "+150 hôm nay"
- [ ] Section "Daily Quests" — countdown timer đến reset (00:00 GMT+7)
- [ ] `<QuestList />` organism
  - 3 quests (Free) / 5 quests (Premium)
  - Stamina hard gate nếu Stamina = 0%
- [ ] Section "Special Challenges" — HOT EVENT banner (static MVP)
- [ ] Leaderboard preview widget

#### `app/quest/[id].tsx`
- [ ] Ref: Stitch "Quest Details: Career Branch"
- [ ] Branch header (màu + icon)
- [ ] Quest title `<Display />` + full description
- [ ] Metadata: duration, difficulty, XP reward
- [ ] `<StaminaBar />` nhỏ nếu có stamina penalty
- [ ] CTA: `<Button primary>Hoàn thành Quest</Button>`
  - → POST `/quests/:id/complete`
  - → XP count-up animation
  - → Check level-up → LevelUpModal nếu có
  - → Haptic LIGHT
- [ ] Back navigation

---

### 4.5 Profile Screen
**Ref:** PRD §2.6 · DESIGN_SYSTEM Prompt 8 · Stitch: "User Profile & Statistics Screen"

#### `app/(tabs)/profile.tsx`
- [ ] **Header:** `<Avatar lg />` + display name + `<LevelBadge />` + total XP
- [ ] **Streak:** `<StreakBadge />` large + "Best: {n} ngày"
- [ ] **Stats Bento Grid (2×2):**
  - Total quests completed (mono font)
  - Days active (mono font)
  - Best streak (mono font)
  - Branches active: "3/4" (mono font)
- [ ] **Branch Progress Bars (4 bars):**
  - Career `#4DA8FF` ██████████ XX%
  - Finance `#34D399` ████████░░ XX%
  - Soft Skills `#FBBF24` ██████░░░░ XX%
  - Well-being `#F472B6` ████░░░░░░ XX%
- [ ] Premium badge card (nếu subscribed): `brandPrimary` glow — "Premium · Active"
- [ ] Wellbeing disclaimer: *"Ứng dụng này không thay thế tư vấn tâm lý chuyên nghiên."*
- [ ] Settings link bottom

---

### 4.6 Wellbeing / Mental Energy Screen
**Ref:** DESIGN_SYSTEM Prompt 7 · PRD §2.4 Business Rules

#### `app/wellbeing.tsx`
- [ ] Accent: `wellbeing #F472B6` trên toàn màn hình
- [ ] `<StaminaBar />` lớn ở top + subtitle contextual ("Bạn đang grinding — hãy nghỉ")
- [ ] 3 Recovery Quest cards (glassmorphism, pink left border):
  - "5 phút thở sâu có hướng dẫn" ☁️
  - "Viết 3 điều bạn biết ơn hôm nay" 📝
  - "Đi bộ 10 phút không dùng điện thoại" 🚶
- [ ] Motivational text: "Taking care of yourself IS progress."
- [ ] Optional: subtle animated background (slow floating orbs — Reanimated)
- [ ] Hotline link nếu 3 ngày mood "rất tệ" liên tiếp

---

### 4.7 Leaderboard Screen
**Ref:** PRD §2.5 · Stitch: "Leaderboard of Persistence"

#### `app/leaderboard.tsx`
- [ ] Tiêu đề: "Leaderboard of Persistence"
- [ ] Top 3 với highlight + avatar lớn hơn
- [ ] Danh sách bên dưới: rank + avatar + tên + streak + XP
- [ ] Highlight hàng của bản thân (user hiện tại)
- [ ] Filter: "This Week" / "All Time" tabs

---

## Phase 5 — Business Logic Layer

### 5.1 Types (`src/business-logic/types/`)

- [ ] `index.ts` — re-export tất cả
- [ ] `branch.types.ts`:
  ```ts
  type Branch = 'career' | 'finance' | 'softskills' | 'wellbeing'
  type NodeStatus = 'locked' | 'in_progress' | 'completed'
  type Difficulty = 'easy' | 'medium' | 'hard'
  type Duration = 5 | 15 | 30
  ```
- [ ] `skill-tree.types.ts`:
  ```ts
  interface SkillNode {
    node_id: string; branch: Branch; tier: 1|2|3
    title: string; description: string
    status: NodeStatus; xp_required: number
    quests_total: number; quests_completed: number
  }
  ```
- [ ] `quest.types.ts`:
  ```ts
  interface Quest {
    quest_id: string; title: string; branch: Branch
    difficulty: Difficulty; duration_min: Duration
    xp_reward: 10 | 25 | 50; completed_at: string | null
  }
  ```
- [ ] `user.types.ts`:
  ```ts
  interface UserProgress {
    user_id: string; level: number; total_xp: number
    current_xp_in_level: number; streak: number
    best_streak: number; stamina: number
    last_active_date: string; onboarding_done: boolean
  }
  ```

### 5.2 Static Data

- [ ] `src/business-logic/data/assessment-questions.ts`
  - 10 câu MCQ, mỗi câu 4 đáp án, mỗi đáp án map 1 branch + weight
- [ ] `src/business-logic/data/skill-tree-nodes.ts`
  - 4 branches × 5–8 nodes = 20–32 nodes seed data
  - Tier 1 (Beginner): XP required thấp (~50–100 XP)
  - Tier 2 (Intermediate): ~200–300 XP
  - Tier 3 (Advanced): ~500–800 XP
- [ ] `src/business-logic/data/quest-library.ts`
  - ~200 quests tiếng Việt (MVP: hardcoded, sau dùng DB)
  - Phân bổ đều 4 nhánh, 3 độ khó
  - Examples từ PRD §2.3 Quest Library

### 5.3 Hooks

- [ ] `useOnboarding.ts` — MCQ state machine, submit, skip logic
- [ ] `useSkillTree.ts` — fetch tree, node unlock check
- [ ] `useQuestManager.ts`:
  - Fetch daily quests (rule-based assignment)
  - Complete quest → POST API → update XP + Stamina
  - Check streak update
- [ ] `useXPEngine.ts`:
  - XP thresholds: `[100, 250, 500, 1000, 1500, 2000…]`
  - `addXP(amount)` → detect level-up
  - Level unlock rewards logic (PRD §2.4 XP Economy)
- [ ] `useStaminaSystem.ts`:
  - Stamina state + threshold color
  - Debuff check: Stamina <30% → Career/Finance XP ×0.5
  - Hard gate check: Stamina = 0%
  - Grinding check: ≥3 Career/Finance, 0 Wellbeing today
- [ ] `useGrowthStreak.ts`:
  - Check streak continuity (lastActiveDate vs today)
  - Milestone detection: 7, 14, 30, 60, 100 ngày
  - Haptic + toast khi đạt milestone
- [ ] `useMoodCheckin.ts`:
  - Daily mood state
  - 3-day consecutive negative mood → wellbeing banner
- [ ] `useAdaptiveDark.ts` — Adaptive Dark Mode theo giờ

### 5.4 Services

- [ ] `QuestService.ts` — rule-based daily quest assignment logic
- [ ] `SkillTreeService.ts` — node unlock, progress calculation
- [ ] `UserService.ts` — profile CRUD, stats aggregation
- [ ] `NotificationService.ts` (MVP scaffold, triển khai đầy đủ P1)

### 5.5 API Layer

- [ ] `src/business-logic/api/client.ts` — Axios instance + JWT header
- [ ] `src/business-logic/api/endpoints/`:
  - `auth.api.ts` — login, register, logout
  - `quests.api.ts` — GET daily, POST complete
  - `skill-tree.api.ts` — GET user tree
  - `progress.api.ts` — GET user progress
  - `mood.api.ts` — POST mood-checkin
- [ ] TanStack Query hooks wrapping API calls

---

## Phase 6 — Micro-interactions & Animations

> Tất cả animation dùng `react-native-reanimated`.

### 6.1 Haptic Map (toàn bộ app)

| Trigger | Haptic |
|---|---|
| Quest complete | `Haptics.impactAsync(LIGHT)` |
| Level up | `Haptics.notificationAsync(SUCCESS)` |
| Stamina warning (<30%) | `Haptics.notificationAsync(WARNING)` |
| Streak milestone | `Haptics.impactAsync(MEDIUM)` |
| Button press (primary) | `Haptics.selectionAsync()` |

- [ ] Tạo `src/ui/atoms/useHaptic.ts` — centralize haptic calls

### 6.2 Animation Implementations

- [ ] Quest checkbox: scale 1→1.3→1 + color fill (300ms spring-bounce)
- [ ] XP count-up: animated number interpolation (600ms ease-out)
- [ ] XP progress bar fill: spring-smooth 600ms
- [ ] Level-up particle burst: radial particles Reanimated (cinematic 800ms)
- [ ] Skill node unlock glow pulse: border glow loop (500ms)
- [ ] Stamina warning shake: translateX oscillation (400ms)
- [ ] Streak badge bounce: scale + translateY (350ms spring-bounce)
- [ ] Onboarding tree reveal: staggered branch appear (cinematic)
- [ ] Bento card press: scale 0.97 (spring-smooth 150ms)
- [ ] Screen transitions: Expo Router default + custom for auth flow

---

## Phase 7 — Backend & Database (Supabase + Fastify)

### 7.1 Supabase Schema

- [ ] `users` — id, email, name, avatar_url, level, total_xp, streak, best_streak, stamina, last_active_date, onboarding_done, onboarding_answers, skill_tree_config, created_at
- [ ] `skill_nodes` — node_id, branch, tier, title, description, xp_required, quests_total
- [ ] `user_nodes` — user_id, node_id, status, quests_completed, unlocked_at
- [ ] `quests` — quest_id, title, branch, difficulty, duration_min, xp_reward, is_active
- [ ] `daily_quest_assignments` — id, user_id, quest_id, assigned_date, completed_at
- [ ] `mood_checkins` — id, user_id, mood_score (1–5), date

### 7.2 Seed Data

- [ ] Insert 20–32 skill nodes (4 branches × 5–8 nodes, 3 tiers)
- [ ] Insert ~200 quests tiếng Việt vào `quests` table

### 7.3 Fastify API (Node.js)

- [ ] `POST /auth/login` — Supabase auth, trả JWT
- [ ] `GET /users/:id/skill-tree` — nodes + user progress
- [ ] `GET /quests/daily` — rule-based assignment
- [ ] `POST /quests/:id/complete` — XP + Stamina calculation
- [ ] `GET /users/:id/progress` — XP, level, streak, stamina
- [ ] `POST /users/:id/mood-checkin` — save mood, trigger wellbeing logic

### 7.4 Cron Jobs

- [ ] **00:00 GMT+7** — Quest reset: xóa assignments ngày cũ, generate mới
- [ ] **23:59 GMT+7** — Stamina decay:
  - ≥1 Wellbeing quest hôm nay → +15 (max 100)
  - 0 Wellbeing → −10
  - ≥3 Career/Finance, 0 Wellbeing → −20
- [ ] **23:59 GMT+7** — Streak check: update streak, reset nếu không có quest hôm nay

---

## Phase 8 — P1 Features (v1.1 — Defer)

### 8.1 Freemium Gate (RevenueCat)
- [-] Setup RevenueCat iOS + Android
- [-] Paywall screen
- [-] Free: 2 branches / 3 quests · Premium (99k VND/tháng): 4 branches / 5 quests / Streak Shield
- [-] Intro offer: 99k/3 tháng → 99k/tháng thường
- [-] Premium badge trên Profile

### 8.2 Push Notifications (Expo Notifications)
- [-] Streak reminder 20:00 nếu chưa có quest hôm nay
- [-] Stamina warning khi <30% (sau cron job)
- [-] Streak milestone: 7, 14, 30, 60, 100 ngày
- [-] Weekly summary: Thứ Hai sáng

### 8.3 Progress Analytics
- [-] XP bar chart theo tuần
- [-] % completion mỗi nhánh
- [-] Calendar heatmap streak history
- [-] So sánh tuần này vs tuần trước

---

## Phase 9 — P2 (v2.0 — Defer)

- [-] Mentor Unlock System (Level 5+) — vetting, scheduling, compensation
- [-] Guild System — 5–10 người, weekly team challenge, private leaderboard
- [-] AI Personalization — NLP mood, predictive burnout detection
- [-] Chat UI / AI Companion — LLM daily check-in

---

## Stitch Screen → App Route Mapping

| Stitch Screen | App Route | Status |
|---|---|---|
| Welcome to Life Skill Tree | `app/(auth)/welcome.tsx` | `[ ]` |
| Goal Assessment Question | `app/(auth)/assessment.tsx` | `[ ]` |
| Skill Tree Reveal Moment | `app/(auth)/reveal.tsx` | `[ ]` |
| Life Skill Tree Home Dashboard | `app/(tabs)/index.tsx` | `[ ]` |
| Life Skill Tree Branch View | `app/(tabs)/tree.tsx` + `app/branch/[id].tsx` | `[ ]` |
| Daily Quests & Challenges Screen | `app/(tabs)/quests.tsx` | `[ ]` |
| Quest Details: Career Branch | `app/quest/[id].tsx` | `[ ]` |
| Level Up Celebration Screen | `src/ui/organisms/LevelUpModal.tsx` | `[ ]` |
| Leaderboard of Persistence | `app/leaderboard.tsx` | `[ ]` |
| User Profile & Statistics Screen | `app/(tabs)/profile.tsx` | `[ ]` |

---

## MVP Delivery Checklist (PRD §6)

- [ ] Onboarding flow: 10 câu MCQ → generating → Skill Tree reveal
- [ ] 4-nhánh Skill Tree UI: locked / in-progress / completed states + animations
- [ ] Thư viện ~200 quests tiếng Việt (AI-generated + human-reviewed)
- [ ] Daily quest assignment rule-based, reset 00:00 GMT+7
- [ ] XP system + level-up animation (LevelUpModal)
- [ ] Stamina bar + decay/recovery cron job (23:59 GMT+7)
- [ ] Growth Streak counter + milestone badges
- [ ] Auth: Email + Google + Apple Sign-In
- [ ] Basic profile page với stats grid + branch progress bars
- [ ] Wellbeing disclaimer + hotline link (trigger 3 ngày "rất tệ" liên tiếp)
- [ ] Push notification scaffold: streak reminder 20:00 (P1 full impl)
- [ ] Mood check-in widget + 3-day negative mood trigger
- [ ] Haptic feedback map đầy đủ
- [ ] Adaptive dark mode theo giờ thiết bị

---

*Ref: PRD_LifeSkillTree.md · MVP_FEATURE_SCOPE.md · TECHNICAL_ARCHITECTURE.md · DESIGN_SYSTEM.md · PROMPT_DESIGN.md*
*Stitch: projects/7641792071217503464 · Cập nhật: 2026-03-17*
