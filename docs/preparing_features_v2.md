# Preparing Features v2 — Gap Analysis

## Current State Summary

| Feature | DB | Logic | UI | Backend | Status |
|---------|----|----|-----|---------|--------|
| Streak | ✅ | ✅ | ✅ | ✅ | **Done** |
| Badges | ❌ | ⚠️ | ⚠️ | ❌ | **UI Only** |
| Shareable Cards | ❌ | ❌ | ❌ | ❌ | **Not Started** |
| Challenges | ✅ | ✅ | ✅ | ⚠️ | **80%** |
| Multiplier/Combo | ✅ | ✅ | ✅ | ✅ | **Done** (minor inconsistency) |
| Focus Mode | ❌ | ❌ | ❌ | ❌ | **Not Started** |
| Profile/Avatar | ✅ | ✅ | ✅ | ✅ | **60%** |
| Leaderboard | ❌ | ❌ | ✅ | ❌ | **Mock Only** |
| Notifications | ✅ | ✅ | ✅ | ❌ | **60%** |
| Events | ❌ | ❌ | ❌ | ❌ | **Not Started** |

---

## 1. Streak Showcase

### ✅ What Exists

| Component | File | Details |
|-----------|------|---------|
| DB columns | `profiles.streak`, `profiles.best_streak`, `profiles.shields_remaining` | Already in schema |
| Streak history table | `streak_history` | Tracks daily streak data |
| Streak logic | `useGrowthStreak.ts` | Consecutive day detection, milestones [7, 14, 30, 60, 100] |
| Streak store | `userStore.updateStreak()` | Persists to Supabase, tracks best_streak |
| Streak shield | `userStore.activateStreakShield()` | Max 2 shields, once per day |
| Shield badge UI | `StreakShieldBadge.tsx` | Animated, haptic feedback |
| Streak display | `SkillsSection.tsx` | Shows streak number + "DAYS STREAK" |
| Login bonus | `LoginBonusModal.tsx` | Bonus XP scales with streak (20/30/50) |
| Master data | `streak_milestone` type | XP rewards at 7/14/30/60/100 days |

### ❌ What's Missing

| Gap | Description | Effort |
|-----|-------------|--------|
| **Fire animation** | No animated fire effect on streak counter — just static text | Low |
| **Streak shame notification** | No "your streak dies in 1 hour" warning | Medium |
| **Streak leaderboard** | No way to compare streaks with other users | High |
| **Streak history UI** | `streak_history` table exists but no visualization screen | Medium |
| **Streak milestone celebration** | Only haptic feedback, no modal/confetti on milestone | Low |
| **Push notification for streak at risk** | `streak_reminder` type exists in DB enum but no scheduling logic | Medium |

---

## 2. Achievement Badges

### ⚠️ What Exists

| Component | File | Details |
|-----------|------|---------|
| Milestone badges UI | `ProfileMilestoneBadges.tsx` | Horizontal scrollable cards with `MilestoneItem` interface |
| Level unlock text | `useXPEngine.ts` | Hardcoded messages like "Unlocked mentor badges" at L5, "Grandmaster title" at L10 |
| Profile milestones | `useProfileScreen.ts` | Derives milestones from user data |

### ❌ What's Missing

| Gap | Description | Effort |
|-----|-------------|--------|
| **Badges DB table** | No `achievements` or `badges` table — milestones are computed client-side, not persisted | Medium |
| **Badge unlock tracking** | No system to track which badges a user has earned | Medium |
| **Badge assets** | Uses Ionicons — no custom badge images or illustrations | Medium |
| **Badge showcase** | No way to pick 3 badges to feature on profile | Low |
| **Badge share** | No shareable card when earning a badge | Low (depends on #3) |
| **Branch badges** | Level-up text references "mentor badges" etc. but they don't exist | Medium |
| **Special badges** | No Night Owl, Early Bird, Perfectionist, Comeback badges | Medium |

---

## 3. Shareable Progress Cards

### ❌ What Exists

Nothing. Zero sharing infrastructure.

### ❌ What's Missing

| Gap | Description | Effort |
|-----|-------------|--------|
| **`expo-sharing`** | Not in package.json | Low |
| **`react-native-view-shot`** | Not in package.json | Low |
| **Card components** | No shareable card React components | Medium |
| **Share flow** | No capture → share sheet integration | Medium |
| **Auto-trigger** | No auto-share prompt after level-up or streak milestone | Low |
| **Daily recap card** | No end-of-day summary card | Medium |
| **Social media optimization** | No IG Story / TikTok size variants | Low |

**Data already available:** XP, level, streak, branch progress, daily stats — all ready to use in cards.

---

## 4. Weekly Challenges

### ✅ What Exists

| Component | File | Details |
|-----------|------|---------|
| DB tables | `challenges`, `user_challenges` | Full schema with progress tracking |
| Challenge store | `challengeStore.ts` | Join/leave, progress, completion/expiry checks |
| Challenge service | `challengeService.ts` | Fetches from Supabase, maps to Challenge type |
| Challenge card UI | `ChallengeCard.tsx` | Progress bar, join/leave, days left |
| Quests screen | `quests.tsx` | Horizontal scroll of ChallengeCards |
| AI generation | `generate-challenges/index.ts` | Edge function for personalized challenges |
| Seed data | `seed_catalog.sql` | Default challenges seeded |

### ❌ What's Missing

| Gap | Description | Effort |
|-----|-------------|--------|
| **Challenge XP rewards** | No XP awarded on challenge completion | Low |
| **Challenge progress persistence** | `recordQuestForChallenges` in store doesn't persist to Supabase | Low |
| **Challenge completion notification** | `challenge_complete` type exists in DB enum but no trigger | Low |
| **Challenge history** | No screen to see past completed challenges | Low |
| **Weekly auto-reset** | No logic to auto-generate new challenges each week | Medium |
| **Challenge leaderboard** | No ranking by challenge completion | Medium |

---

## 5. Daily Quest Multiplier

### ✅ What Exists

| Component | File | Details |
|-----------|------|---------|
| Combo logic | `useXPEngine.ts` | `getComboMultiplier()`: 3+ = 1.5x, 4+ = 1.75x, 5+ = 2.0x |
| Session combo | `dailyStats.session_combo` | Incremented per quest, reset on login |
| ComboBar UI | `ComboBar.tsx` | Animated pill with fire icon |
| XP multiplier | `useXPEngine.ts` | Applied before adding XP |
| Stamina multiplier | `useStaminaSystem.ts` | 0x/0.5x/0.75x/1.0x based on stamina |
| Master data | `combo_multiplier` type | DB config for thresholds |

### ⚠️ Issues

| Issue | Details |
|-------|---------|
| **ComboBar values mismatch** | `ComboBar.tsx` shows x1.25, x1.5 but `useXPEngine` uses 1.5, 1.75, 2.0 |
| **No combo reset timer** | Combo only resets on daily login, not on time gap between quests |
| **Session combo vs daily streak combo** | Current combo is per-session (resets on login), not per-day-streak |

### ❌ What's Missing

| Gap | Description | Effort |
|-----|-------------|--------|
| **Streak-based daily multiplier** | No multiplier that grows with consecutive completion days (1.0x → 2.0x over 30 days) | Medium |
| **Multiplier visual on quests** | Quest cards don't show the active multiplier | Low |

---

## 6. Focus Mode

### ❌ What Exists

Nothing. `duration_min` field on quests (5/15/30) is only metadata.

### ❌ What's Missing

| Gap | Description | Effort |
|-----|-------------|--------|
| **Timer component** | No countdown timer UI | Medium |
| **Focus mode flow** | No start → timer → complete flow | Medium |
| **Background timer** | No `expo-task-manager` or background execution | High |
| **Ambient sounds** | No audio integration | Medium |
| **Focus XP bonus** | No bonus for completing in focus mode | Low |
| **Focus reflection** | No post-focus "how focused were you?" prompt | Low |

---

## 7. Profile Customization

### ✅ What Exists

| Component | File | Details |
|-----------|------|---------|
| Profile table | Schema | `name`, `avatar_url`, `level`, `streak`, `primary_branch` |
| ProfileHeader | `ProfileHeader.tsx` | Initials avatar circle, level badge |
| Profile screen | `profile.tsx` | Full stats, milestones, weekly chart |
| Theme store | `themeStore.ts` | Light/dark/system mode |
| Settings | `settings.tsx` | Theme picker, notification toggle |

### ❌ What's Missing

| Gap | Description | Effort |
|-----|-------------|--------|
| **Avatar picker** | `avatar_url` column exists but unused — no picker/gallery | Medium |
| **Title system** | Level-up text mentions "Grandmaster title" at L10 but not implemented | Medium |
| **Accent color themes** | Only light/dark, no color customization | Medium |
| **Profile edit screen** | "Personal info" button does `onPress={() => {}}` | Low |
| **Profile card export** | No shareable profile card | Low (depends on #3) |

---

## 8. Leaderboard

### ✅ What Exists

| Component | File | Details |
|-----------|------|---------|
| Leaderboard screen | `leaderboard.tsx` | Full UI: podium top-3, ranked list, user card |
| Navigation entry | `ProfileNavSection.tsx` | "Bảng xếp hạng" link |
| Route | `_layout.tsx` | Stack screen registered |

### ❌ What's Missing

| Gap | Description | Effort |
|-----|-------------|--------|
| **All data is mock** | Hardcoded `MOCK_WEEKLY` and `MOCK_ALLTIME` arrays | — |
| **Leaderboard API** | No service to fetch real rankings | High |
| **Leaderboard DB** | No table or query for rankings | Medium |
| **Friend comparison** | No friend system or comparison feature | High |
| **Branch leaderboard** | No per-branch ranking | Medium |
| **Real-time updates** | No live ranking updates | High |

---

## 9. Notifications

### ✅ What Exists

| Component | File | Details |
|-----------|------|---------|
| DB table | `notifications` | `type`, `title`, `body`, `is_read` |
| Type enum | DB | `streak_reminder`, `quest_suggestion`, `level_up`, `challenge_complete`, `wellbeing_warning` |
| Notification store | `notificationStore.ts` | Add, markRead, markAllRead, clearAll, max 50 |
| Notifications screen | `notifications.tsx` | List with icons, relative time, unread bar |
| Settings toggle | `settings.tsx` | `dailyNotifications` toggle |
| Home badge | `useHomeScreen.ts` | Unread count on notification icon |

### ❌ What's Missing

| Gap | Description | Effort |
|-----|-------------|--------|
| **Push notifications** | No `expo-notifications` integration | High |
| **Notification scheduling** | Toggle exists but does nothing | High |
| **Server-side generation** | Store is client-only, DB notifications never fetched | Medium |
| **Type mismatch** | Store types (`milestone\|streak\|levelup`) don't match DB enum (`streak_reminder\|quest_suggestion\|level_up`) | Low |
| **Smart timing** | No logic for optimal notification time | Medium |
| **Sound/vibration settings** | No notification preferences beyond on/off | Low |

---

## 10. Limited-Time Events

### ❌ What Exists

Nothing.

### ❌ What's Missing

| Gap | Description | Effort |
|-----|-------------|--------|
| **Events table** | No DB schema | Medium |
| **Event logic** | No event creation, scheduling, or expiration | High |
| **Event UI** | No event cards, banners, or dedicated screen | Medium |
| **XP multiplier events** | No "2x Career XP this week" mechanic | Low (uses existing multiplier) |
| **Event rewards** | No exclusive badges/items for events | Medium (depends on #2) |
| **Global events** | No "community quest count" mechanic | High |
| **Seasonal themes** | No seasonal UI changes | Medium |

---

## Implementation Roadmap

### Phase 1 — Quick Wins (1-2 weeks)
| Task | Depends On | Effort |
|------|-----------|--------|
| Fix ComboBar values mismatch | None | 30min |
| Fix notification type mismatch | None | 1hr |
| Add fire animation to streak display | None | 2hrs |
| Add streak milestone celebration modal | None | 3hrs |
| Add XP reward on challenge completion | Challenge store | 2hrs |
| Add multiplier display on quest cards | None | 1hr |
| Fix "Personal info" button in settings | None | 2hrs |

### Phase 2 — Core Features (2-4 weeks)
| Task | Depends On | Effort |
|------|-----------|--------|
| Shareable progress cards | #3 packages | 3 days |
| Badge system (DB + unlock tracking + UI) | None | 5 days |
| Streak shame notification | Push notifications | 2 days |
| Avatar picker | None | 2 days |
| Title system | Badge system | 2 days |

### Phase 3 — Engagement (4-6 weeks)
| Task | Depends On | Effort |
|------|-----------|--------|
| Focus mode (timer + flow) | None | 5 days |
| Leaderboard (real API) | None | 5 days |
| Push notifications | None | 5 days |
| Streak-based daily multiplier | None | 2 days |
| Challenge weekly auto-reset | None | 3 days |

### Phase 4 — Growth (6-8 weeks)
| Task | Depends On | Effort |
|------|-----------|--------|
| Limited-time events system | Badges, Multiplier | 5 days |
| Friend comparison | Leaderboard | 5 days |
| Smart notification scheduling | Push notifications | 3 days |
| Global community events | Events system | 5 days |
| Seasonal themes | Profile customization | 3 days |
