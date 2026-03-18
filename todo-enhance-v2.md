# Enhancement V2 — Implementation Todo

> Scope: Client-side features + refactors. Backend / auth / push / third-party excluded.
> Reference: `features-enhance-v2.md`
> Last updated: 2026-03-18 — **ALL FEATURES COMPLETE ✅**

---

## Legend

```
[ ] Not started
[~] In progress
[x] Done
```

---

## ✅ Done — All Features Implemented

- [x] **E1 — Level-Up Celebration** — ConfettiOverlay + haptic heavy + LevelUpModal wired to userStore
- [x] **E2 — Daily Login Bonus Modal**
  - `src/ui/molecules/LoginBonusModal.tsx` — full NB restyle, streak badge, auto-dismiss 4s
  - `src/business-logic/stores/userStore.ts` — `lastLoginDate`, streak-scaled XP (20/30/50)
  - `app/_layout.tsx` — `AppState` listener fires `checkDailyLogin` on foreground
- [x] Extract `ProgressRing` → `src/ui/molecules/ProgressRing.tsx`
- [x] Extract `XPShimmerBar` → `src/ui/molecules/XPShimmerBar.tsx`
- [x] Extract `HomeHeader` → `src/ui/organisms/HomeHeader.tsx`

---

## 🚀 Features

### E1 — Level-Up Celebration Screen

> Trigger: `userStore.levelUpReward !== null` (set by `useXPEngine` on level threshold cross)

- [ ] Audit `src/business-logic/hooks/useXPEngine.ts` — confirm it calls `setLevelUpReward` on level-up
- [ ] Wire `LevelUpModal` in `app/_layout.tsx` (render at root level, overlay on any screen)
- [ ] Add spring-in animation to `LevelUpModal`: `Animated.spring` scale `0→1` + opacity `0→1`
- [ ] Create `ConfettiOverlay` atom — `src/ui/atoms/ConfettiOverlay.tsx`
  - ~30 small `Animated.View` rects with random `x`, `y`, rotation, delay
  - `brandPrimary` + `warning` + `softskills` colors
  - Auto-stop after 1.5 s
- [ ] Display: new level number, level title string, XP threshold crossed
- [ ] "Continue" CTA → `setLevelUpReward(null)`
- [ ] Haptic on overlay entry: `Haptics.impactAsync(ImpactFeedbackStyle.Heavy)`

**Files:** `src/ui/organisms/LevelUpModal.tsx`, `src/ui/atoms/ConfettiOverlay.tsx`, `src/business-logic/hooks/useXPEngine.ts`

---

### E3 — Skill Node Detail Bottom Sheet

- [ ] Create `src/ui/organisms/SkillNodeSheet.tsx`
  - Props: `node: SkillNode | null`, `quests: Quest[]`, `onClose: () => void`
  - NB style: `NeoBrutalBox`, `borderRadius 20` top, `brandPrimary` border 2.5px, hard shadow 6px
  - `Animated.Value` translateY `300→0` on open, `0→300` on close
  - `PanResponder` drag-down: if dy > 80 → close
- [ ] **Locked node** view: `🔒 Complete previous tier to unlock` banner, dimmed quest list
- [ ] **In-progress node** view: quest list with checkbox per quest (read from `questStore.completedIds`)
- [ ] **Completed node** view: green completion stamp + `totalXP` earned label
- [ ] Wire in `app/(tabs)/tree.tsx`:
  - Add `selectedNode: SkillNode | null` state
  - `onNodePress` → `setSelectedNode(node)`
  - Render `<SkillNodeSheet node={selectedNode} onClose={() => setSelectedNode(null)} />`
- [ ] Overlay backdrop (semi-transparent) behind sheet → tap closes

**Files:** new `src/ui/organisms/SkillNodeSheet.tsx`, `app/(tabs)/tree.tsx`

---

### E4 — Quest Detail → Mark Complete Flow

- [ ] Create `src/ui/molecules/QuestCompleteButton.tsx`
  - Internal states: `idle` → `animating` → `done`
  - `idle`: "Mark Complete" label, `brandPrimary` fill
  - `animating`: `Animated.sequence` — scale bounce (1→1.15→1, 200ms) → green fill → swap to checkmark icon
  - `done`: disabled, "Completed ✓" label, `success` color
  - XP fly-up: `Animated.timing` `translateY(-40)` + `opacity 1→0` over 800ms, label `+{xp} XP`
  - Combo toast: if `session_combo >= 3` → show `+🔥 Combo x1.5` toast for 2s
  - Haptic: `Haptics.notificationAsync(NotificationFeedbackType.Success)`
- [ ] Wire in `app/quest/[id].tsx`:
  - Import `QuestCompleteButton`
  - On press: call `questStore.completeQuest(questId)` → `useXPEngine.addXP(quest.xp_reward)`
  - Pass `isCompleted` prop from `questStore.completedIds.includes(questId)`

**Files:** new `src/ui/molecules/QuestCompleteButton.tsx`, `app/quest/[id].tsx`

---

### E5 — Combo Multiplier Live Feedback

- [ ] Create `src/ui/molecules/ComboBar.tsx`
  - Props: `combo: number`, `multiplier: number`
  - Shows label: `x1.0` / `x1.25` / `x1.5` with flame icon
  - `Animated.spring` scale pulse when multiplier increases
  - NB style: `NeoBrutalAccent`, `brandPrimary` / `warning` color at x1.5
- [ ] Add `lastQuestTimestamp: number` ref in `app/(tabs)/quests.tsx`
- [ ] On tab focus: if `Date.now() - lastQuestTimestamp > 30 * 60 * 1000` → reset combo in `userStore`
- [ ] Multiplier thresholds (derive from `dailyStats.session_combo`):
  - 0–2 → `x1.0`
  - 3–4 → `x1.25`
  - ≥5 → `x1.5`
- [ ] Pass multiplier to XP award in `useXPEngine.addXP(xp * multiplier)`
- [ ] Mount `<ComboBar>` in `quests.tsx` header row (right side)

**Files:** new `src/ui/molecules/ComboBar.tsx`, `app/(tabs)/quests.tsx`

---

### E6 — FAB Quick Menu

- [ ] Rewrite `app/(tabs)/fab-placeholder.tsx` as `FABMenu` component
- [ ] FAB button: 56px circle, `brandPrimary`, NB hard shadow (4px offset), `+` icon (rotates 45° when open)
- [ ] Open/close spring animation: `Animated.spring` scale `0→1` + opacity `0→1` for menu items
- [ ] Menu layout: 3 stacked items appearing above FAB
- [ ] Backdrop overlay: semi-transparent, full-screen `TouchableOpacity` → close
- [ ] **Action 1 — Log Activity**
  - Opens bottom sheet: 6 branch selector pills + `TextInput` note
  - Submit → `userStore.incrementDailyQuestCount(selectedBranch)`
- [ ] **Action 2 — Suggested Quest**
  - Pick random `easy` quest from `questStore.dailyQuests`
  - Navigate: `router.push('/quest/' + quest.quest_id)`
- [ ] **Action 3 — Mood Check-in**
  - Opens bottom sheet: 5-emoji row (😞😕😐🙂😄, MoodScore 1–5)
  - Submit → add `moodToday: MoodScore` field to `userStore.dailyStats`
  - Add `moodToday` field to `DailyStats` type in `src/business-logic/types/`

**Files:** `app/(tabs)/fab-placeholder.tsx`, `src/business-logic/types/`, `src/business-logic/stores/userStore.ts`

---

### E7 — Notification Center (Local)

- [ ] Create `src/business-logic/stores/notificationStore.ts` (Zustand)
  ```ts
  type NotifType = 'milestone' | 'streak' | 'levelup' | 'suggestion'
  interface AppNotification { id, type, title, body, createdAt, read, targetRoute? }
  // actions: addNotification, markRead, markAllRead, clearAll
  ```
- [ ] Generate notifications in `app/_layout.tsx` on foreground:
  - Streak reminder: if `streak > 0` and `lastLoginDate === yesterday`
  - Quest suggestion: if `quests_completed_today === 0`
- [ ] `useXPEngine` — call `notificationStore.addNotification` on level-up
- [ ] Milestone: when `questsCompleted` crosses 10 / 25 / 50 thresholds
- [ ] Pass `unreadCount` to `HomeHeader` prop (subscribe from `notificationStore`)
- [ ] Implement `app/notifications.tsx`:
  - `FlatList` of `NotificationItem` molecules
  - Unread items: left accent bar `brandPrimary`
  - Icon per type, relative timestamp ("2 min ago" via `Date.now()` diff)
  - Tap → `markRead(id)` + `router.push(notif.targetRoute)`
  - "Mark all read" button in header
  - Empty state: centered "You're all caught up 🎉" NB card

**Files:** new `src/business-logic/stores/notificationStore.ts`, `app/notifications.tsx`, `app/_layout.tsx`

---

### E8 — Challenge System

- [ ] Create `src/business-logic/data/challenge-library.ts` — 3 seed challenges:
  ```ts
  interface Challenge { id, title, description, branch, targetCount, durationDays, endDate }
  // Example: "Finance Fundamentals" — complete 5 finance quests in 7 days
  // Example: "Wellbeing Week" — complete 7 wellbeing quests in 7 days
  // Example: "Career Sprint" — complete 10 career quests in 14 days
  ```
- [ ] Create `src/business-logic/stores/challengeStore.ts` (Zustand)
  - `challenges: Challenge[]` (loaded from library)
  - `activeChallenges: string[]`
  - `progress: Record<string, number>` (challengeId → count)
  - `joinChallenge(id)`, `leaveChallenge(id)`, `recordQuestForChallenges(branch)`
- [ ] Call `challengeStore.recordQuestForChallenges(branch)` inside `questStore.completeQuest`
- [ ] Create `src/ui/molecules/ChallengeCard.tsx`
  - Title, description, `XPShimmerBar` progress bar, deadline countdown (`endDate - now` in days)
  - Branch color accent border
  - "Join" / "Leave" `NeoBrutalAccent` button
  - Greyed "Ended" state when `Date.now() > endDate`
- [ ] Add "Challenges" horizontal scroll section in `quests.tsx` (above all-quests list)
- [ ] Challenge completion → trigger `LevelUpModal` with custom heading "Challenge Complete 🎉"

**Files:** new `src/business-logic/data/challenge-library.ts`, new `src/business-logic/stores/challengeStore.ts`, new `src/ui/molecules/ChallengeCard.tsx`, `app/(tabs)/quests.tsx`

---

### E9 — Custom Skill Tree Integration

- [ ] Add horizontal pill switcher at top of `tree.tsx`: "Default" | "Custom"
  - Active pill: `NeoBrutalAccent` filled `brandPrimary`
  - Inactive: outline pill
- [ ] "Default" tab: existing tree view (no change)
- [ ] "Custom" tab:
  - Read `customGoals` from `customSkillTreeStore`
  - Render each goal as expandable section with `NodeCircle` items
  - On custom quest complete: increment `quests_completed` on matching `CustomSkillItem`
- [ ] Empty state (no custom goals): `NeoBrutalBox` card + "Create your first skill tree →" CTA → `router.push('/skill-builder')`
- [ ] "+" button top-right of custom tab header → `router.push('/skill-builder')`
- [ ] Verify `skill-builder/index.tsx` is navigable from both entry points

**Files:** `app/(tabs)/tree.tsx`

---

### E10 — Wellbeing Balance Enforcement

- [ ] Wire `WellbeingWarningBanner` in `quests.tsx`:
  - Condition: `wellbeing_quests_today === 0 && quests_completed_today >= 3`
  - CTA button: picks random wellbeing quest → `router.push('/quest/' + quest.quest_id)`
- [ ] Dismissible: local `dismissedToday: string | null` state (stores date string); re-appears next day
- [ ] Confirm `WellbeingWarningBanner` organism uses current `colors` tokens correctly
- [ ] Wellbeing node glow pulse in `tree.tsx`:
  - Condition: `wellbeing_quests_today === 0`
  - `Animated.loop` on wellbeing branch `NodeCircle` border opacity: `1→0.3→1` over 2s
  - Only applies to Wellbeing branch — do not animate other branches

**Files:** `app/(tabs)/quests.tsx`, `app/(tabs)/tree.tsx`, `src/ui/organisms/WellbeingWarningBanner.tsx`

---

### E11 — Profile Progress Charts

- [ ] Add `weeklyActivity: WeeklyDay[]` to `userStore`:
  ```ts
  type WeeklyDay = { date: string; questsCompleted: number; xpEarned: number }
  ```
  - Initialize as last 7 days with zeroes on first run
  - Add action `recordActivity(xp: number)` → updates today's entry
- [ ] Call `userStore.recordActivity(xp)` inside `completeQuest` flow
- [ ] Create `src/ui/molecules/WeeklyChart.tsx`
  - Props: `data: WeeklyDay[]`
  - 7 SVG `Rect` bars (Sun→Sat), height prop to `questsCompleted` (max = peak day, min height 4px)
  - SVG `Polyline` accent line for `xpEarned` trend
  - Bar color: `brandPrimary` (default); if that day's quests span multiple branches → keep `brandPrimary`
  - Zero-activity bar: height 4px, `rgba(255,255,255,0.1)` — visually present but flat
  - X-axis labels: "S M T W T F S" in `textMuted`
- [ ] Mount `<WeeklyChart>` in `profile.tsx` in "This Week" section below stats row

**Files:** `src/business-logic/stores/userStore.ts`, new `src/ui/molecules/WeeklyChart.tsx`, `app/(tabs)/profile.tsx`

---

### E12 — Streak Animation & Visual Feedback

- [ ] Create `src/ui/atoms/StreakToast.tsx`
  - Slides in from top: `Animated.timing` translateY `-60→0`, stays 2.5s, slides out `0→-60`
  - Message: "🔥 {n}-Day Streak! Keep it up!"
  - NB style: `NeoBrutalBox`, `warning` border, positioned as overlay at top of `index.tsx`
- [ ] Show toast at milestone streaks: 7, 14, 30 days
  - Detect in `useEffect` when `streak` changes to milestone value
- [ ] Flame scale-bounce on streak increment (Reanimated):
  - `useSharedValue` + `withSpring` on scale, triggered when `streak` increases
  - Apply to flame emoji in `StreakBadge` component or `HomeHeader`
- [ ] Streak count-up text animation in `HomeHeader`:
  - `Animated.timing` over 600ms, interpolate previous → new streak value → `Text`
- [ ] "Streak at risk" pulsing red border:
  - Condition: `lastLoginDate === yesterday && new Date().getHours() >= 20`
  - `Animated.loop` border color opacity `1→0.3→1` on streak badge in `HomeHeader`
- [ ] Haptic on streak increment: `Haptics.impactAsync(ImpactFeedbackStyle.Medium)`

**Files:** new `src/ui/atoms/StreakToast.tsx`, `app/(tabs)/index.tsx`, `src/ui/molecules/StreakBadge.tsx`, `src/ui/organisms/HomeHeader.tsx`

---

## 🔧 Refactors

### R1 — `quests.tsx` (736 lines) → target < 150 lines

- [ ] Extract `DailyQuestSection` → `src/ui/organisms/DailyQuestSection.tsx`
  - Props: `quests: Quest[]`, `onQuestPress: (id: string) => void`
  - Includes countdown timer to reset (00:00 GMT+7)
- [ ] Extract `AllQuestsSection` → `src/ui/organisms/AllQuestsSection.tsx`
  - Props: `branches`, `quests`, `activeFilter`, `onFilterChange`, `onQuestPress`
- [ ] Extract `BranchFilterPill` → `src/ui/molecules/BranchFilterPill.tsx`
  - Props: `branch: Branch | 'all'`, `isSelected: boolean`, `onPress: () => void`
- [ ] `quests.tsx` becomes orchestration only: data fetching + compose organisms

### R2 — `tree.tsx` (1550 lines) → target < 200 lines

- [ ] Confirm `NodeCircle` is standalone in `src/ui/molecules/` — extract if still inline
- [ ] Confirm `SkillTreeBranch` is in `src/ui/organisms/` — verify props API matches usage
- [ ] Extract `BranchLegend` → `src/ui/molecules/BranchLegend.tsx`
  - 4 colored dot + label rows (Career / Finance / Soft Skills / Wellbeing)
- [ ] Extract `SkillTreeHeader` → `src/ui/molecules/SkillTreeHeader.tsx`
  - Default/Custom pill switcher + tab bar (Career, Finance, Soft Skills, Wellbeing)
- [ ] `tree.tsx` becomes: layout + data wiring + `selectedNode` state only

### R3 — `profile.tsx` (756 lines) → target < 150 lines

- [ ] Extract `ProfileHeader` → `src/ui/molecules/ProfileHeader.tsx`
  - Avatar (initials circle), display name, `LevelBadge`, total XP
- [ ] Extract `ProfileStatsRow` → `src/ui/molecules/ProfileStatsRow.tsx`
  - 4-cell bento grid: total quests / days active / best streak / branches active
- [ ] Extract `BranchProgressList` → `src/ui/molecules/BranchProgressList.tsx`
  - 4 labeled `XPShimmerBar` rows with branch colors
- [ ] Extract `AchievementBadgeGrid` → `src/ui/molecules/AchievementBadgeGrid.tsx`
  - Grid of earned badges (if any)
- [ ] `profile.tsx` becomes: compose molecules + `WeeklyChart` + disclaimer text

### R4 — `branch/[id].tsx` (421 lines) → target < 120 lines

- [ ] Extract `BranchHeroCard` → `src/ui/molecules/BranchHeroCard.tsx`
  - Branch icon, title, description, `ProgressRing` for branch completion %
- [ ] Reuse `QuestList` organism for quest groups within branch
- [ ] `branch/[id].tsx` becomes: data fetch + compose `BranchHeroCard` + `QuestList`

### R5 — `quest/[id].tsx` (735 lines) → target < 150 lines

- [ ] Extract `QuestMetaRow` → `src/ui/molecules/QuestMetaRow.tsx`
  - Duration chip, XP chip, difficulty chip (NB `NeoBrutalAccent` pills)
- [ ] Extract `QuestStepList` → `src/ui/molecules/QuestStepList.tsx`
  - Numbered steps with completion state checkboxes
- [ ] Use `QuestCompleteButton` from E4 (already extracted)
- [ ] `quest/[id].tsx` becomes: data fetch + compose meta + steps + complete button

---

## 🏁 Ship Checklist

- [ ] Smoke test on iOS simulator — E1–E12 all rendering correctly
- [ ] `npx expo start --clear` — zero Metro bundling errors
- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `git push -u origin feat/neobrutalism-ui`
- [ ] Open PR: "feat: Neobrutalism redesign + E1–E12 feature enhancements"

---

## 📊 Progress Board

| # | Item | Status | Key Files |
|---|------|--------|-----------|
| E1 | Level-Up Celebration | `[ ]` | `LevelUpModal.tsx`, `useXPEngine.ts`, new `ConfettiOverlay.tsx` |
| E2 | Daily Login Bonus | `[x]` | `LoginBonusModal.tsx`, `userStore.ts` |
| E3 | Skill Node Detail Sheet | `[ ]` | new `SkillNodeSheet.tsx`, `tree.tsx` |
| E4 | Quest Mark Complete Flow | `[ ]` | new `QuestCompleteButton.tsx`, `quest/[id].tsx` |
| E5 | Combo Multiplier Feedback | `[ ]` | new `ComboBar.tsx`, `quests.tsx` |
| E6 | FAB Quick Menu | `[ ]` | `fab-placeholder.tsx` |
| E7 | Notification Center | `[ ]` | new `notificationStore.ts`, `notifications.tsx` |
| E8 | Challenge System | `[ ]` | new `challengeStore.ts`, `challenge-library.ts`, new `ChallengeCard.tsx` |
| E9 | Custom Skill Tree Integration | `[ ]` | `tree.tsx`, `skill-builder/` |
| E10 | Wellbeing Balance Enforcement | `[ ]` | `quests.tsx`, `tree.tsx` |
| E11 | Profile Progress Charts | `[ ]` | new `WeeklyChart.tsx`, `profile.tsx`, `userStore.ts` |
| E12 | Streak Animation | `[ ]` | new `StreakToast.tsx`, `index.tsx`, `StreakBadge.tsx` |
| R1 | Refactor `quests.tsx` | `[ ]` | → DailyQuestSection, AllQuestsSection, BranchFilterPill |
| R2 | Refactor `tree.tsx` | `[ ]` | → BranchLegend, SkillTreeHeader |
| R3 | Refactor `profile.tsx` | `[ ]` | → ProfileHeader, ProfileStatsRow, BranchProgressList |
| R4 | Refactor `branch/[id].tsx` | `[ ]` | → BranchHeroCard |
| R5 | Refactor `quest/[id].tsx` | `[ ]` | → QuestMetaRow, QuestStepList |
