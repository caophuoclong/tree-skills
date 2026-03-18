# Features Enhancement V2

> Scope: Client-side features only. Backend, authentication, push notifications, and third-party integrations are excluded.

---

## E1 — Level-Up Celebration Screen

**As a user, I want to see a full-screen celebration when I level up, so that reaching a new level feels rewarding and worth repeating.**

- AC: Full-screen overlay animates in on level-up event from `useXPEngine`
- AC: Shows new level number, level title, and XP threshold crossed
- AC: Confetti / particle burst plays for ≥ 1.5 seconds
- AC: "Continue" CTA dismisses the overlay and returns to previous screen
- AC: Haptic feedback fires on overlay entry (heavy impact)
- AC: `LevelUpModal` organism (already exists) is wired to the trigger in `userStore`

---

## E2 — Daily Login Bonus Modal

**As a user, I want to receive a bonus reward on my first session each day, so that I feel motivated to open the app consistently.**

- AC: `checkDailyLogin()` in `userStore` fires on app foreground after `fontsLoaded`
- AC: If today's date ≠ `last_login_at` date, `LoginBonusModal` is triggered
- AC: Modal shows day streak count, bonus XP amount, and an animated coin/star icon
- AC: Bonus XP is added via `useXPEngine` and reflected in home screen immediately
- AC: Modal auto-dismisses after 4 s or on user tap
- AC: `last_login_at` is updated in `userStore` after bonus is claimed

---

## E3 — Skill Node Detail Bottom Sheet

**As a user, I want to tap a node on the skill tree and see its details, so that I understand what skills and quests belong to each node before committing.**

- AC: Tapping any node in `tree.tsx` opens a bottom sheet sliding up from the bottom
- AC: Sheet displays: node title, branch color accent, tier badge, description, quests list (title + XP + duration per quest)
- AC: Locked nodes show a "🔒 Complete previous tier to unlock" banner instead of quest list
- AC: In-progress nodes show per-quest completion checkboxes reflecting `questStore` state
- AC: Completed nodes show a completion stamp and total XP earned
- AC: Sheet is dismissible via drag-down gesture or overlay tap
- AC: Sheet uses Neobrutalism style consistent with `branch/[id].tsx` modal

---

## E4 — Quest Detail → Mark Complete Flow

**As a user, I want to mark a quest as complete from its detail screen and immediately see my XP and progress update, so that the completion loop feels satisfying.**

- AC: "Mark Complete" button in `quest/[id].tsx` calls `completeQuest()` from `questStore`
- AC: XP awarded via `useXPEngine`, with `xp_reward` sourced from the quest object
- AC: Button animates: scale bounce → green fill → checkmark icon swap
- AC: Haptic notification fires on completion (`NotificationFeedbackType.Success`)
- AC: XP fly-up `+XP` label animates upward and fades out over the button
- AC: If combo streak ≥ 3, a short "+🔥 Combo x1.5" toast appears below the button
- AC: Button becomes disabled (shows "Completed ✓") on subsequent visits to the same quest

---

## E5 — Combo Multiplier Live Feedback

**As a user, I want to see my combo multiplier grow as I complete quests in a session, so that I feel rewarded for doing multiple quests in one sitting.**

- AC: Combo counter in `quests.tsx` header increments each time a quest is completed in the current session
- AC: Banner shows current multiplier label: `x1.0`, `x1.25`, `x1.5` at 0 / 3 / 5 consecutive completions
- AC: Banner animates (scale pulse) each time multiplier increases
- AC: Multiplier resets to `x1.0` if the user exits quests tab and returns after > 30 min (use `Date.now()` diff stored in component state)
- AC: XP awarded in `completeQuest` is multiplied by current combo value from `useXPEngine`

---

## E6 — FAB Quick Menu

**As a user, I want a floating action button that gives me quick access to the most common daily actions, so that I can log activity or start a quest without navigating through tabs.**

- AC: FAB renders in `fab-placeholder.tsx` as a circular button centered above the nav bar
- AC: Single tap opens a radial / stacked menu with 3 actions:
  - **Log Activity** → opens a bottom sheet with branch selector + free-text input
  - **Suggested Quest** → deep-links to a randomly selected `easy` quest from `questStore.dailyQuests`
  - **Mood Check-in** → opens a 5-emoji mood picker (1–5 scale matching `MoodScore`)
- AC: Menu opens/closes with spring animation (scale + opacity)
- AC: Overlay backdrop taps close the menu
- AC: FAB uses `brandPrimary` color with NB hard shadow, consistent with design system
- AC: Mood Check-in result is stored in `dailyStats.moodToday` in `userStore`

---

## E7 — Notification Center (Local)

**As a user, I want a dedicated screen to view all my in-app notifications, so that I don't miss milestone achievements, streak reminders, or quest suggestions.**

- AC: Bell icon in home header navigates to `app/notifications.tsx` (modal, `slide_from_left` — already registered in `_layout.tsx`)
- AC: Notification items are stored as an array in `userStore` (or a dedicated `notificationStore`)
- AC: Notification types:
  - 🏆 **Milestone** — "You completed 10 quests!" (triggered by completion count threshold)
  - 🔥 **Streak reminder** — "Don't break your 5-day streak!" (generated at app open if last active = yesterday)
  - ⭐ **Level up** — "You reached Level 4!" (generated by `useXPEngine` on level change)
  - 💡 **Quest suggestion** — "Try this 5-min Finance quest" (generated daily on app open if 0 quests done today)
- AC: Unread count badge on bell icon in home header reflects unseen notification count
- AC: Tapping a notification item marks it as read and navigates to relevant screen
- AC: "Mark all read" button clears unread count
- AC: Empty state shows "You're all caught up 🎉"

---

## E8 — Challenge System

**As a user, I want to join weekly challenges and track my progress against a goal, so that I have an extra layer of motivation beyond daily quests.**

- AC: Challenges tab section in `quests.tsx` renders real challenge data from a `challengeStore`
- AC: Each challenge card shows: title, description, progress bar (completed / target), deadline countdown, branch color
- AC: "Join" button adds the challenge to `userStore.activeChallenges`; becomes "Leave" after joining
- AC: Progress auto-updates when user completes quests matching the challenge's branch
- AC: Completing a challenge triggers the Level-Up Celebration screen variant with "Challenge Complete 🎉" heading
- AC: A challenge expires at its deadline regardless of completion — shown as greyed out with "Ended" label
- AC: Seed data: 3 default challenges loaded from a local `challenge-library.ts` (no backend required)

---

## E9 — Custom Skill Tree Builder Integration

**As a user, I want to access my custom AI-generated skill trees from the main navigation, so that I can work on personalised goals alongside the default curriculum.**

- AC: Skill Tree tab (`tree.tsx`) adds a horizontal pill switcher at top: "Default" | "Custom"
- AC: "Custom" tab renders the list of saved `customGoals` from `customSkillTreeStore`
- AC: If no custom goals exist, an empty state CTA links to `skill-builder/` modal
- AC: Custom skill tree nodes follow the same `NodeCircle` rendering logic as default nodes
- AC: Completing a custom quest increments `quests_completed` on the matching `CustomSkillItem`
- AC: The `skill-builder/` modal is accessible from both the empty state CTA and a "+" button in the custom tab header

---

## E10 — Wellbeing Balance Enforcement

**As a user, I want the app to nudge me toward wellbeing quests when I haven't done any in a while, so that I maintain balance rather than grinding only career or finance quests.**

- AC: If `dailyStats.wellbeing_quests_today === 0` and user has completed ≥ 3 non-wellbeing quests today, a `WellbeingWarningBanner` appears at the top of `quests.tsx`
- AC: Banner message: "You've been focused — take a 5-min wellbeing break 🧘" with a CTA linking to a random wellbeing quest
- AC: Banner is dismissible (× button) and stays dismissed for the remainder of the day (use a `dismissedAt` date in component state)
- AC: In `tree.tsx`, Wellbeing branch node glows / pulses softly if no wellbeing quests completed today (border opacity animation, not intrusive)
- AC: `WellbeingWarningBanner` organism (already exists in `src/ui/organisms/`) is wired to the logic above

---

## E11 — Profile Progress Charts

**As a user, I want to see a visual chart of my XP and quest completions over the past 7 days on my profile, so that I can track my consistency and improvement over time.**

- AC: Profile screen adds a "This Week" section below the stats row
- AC: Bar chart shows per-day quest completion count for the last 7 days (Sun → Sat)
- AC: A secondary line or accent bar shows XP earned per day
- AC: Data is derived from a `weeklyActivity` array stored in `userStore` — an array of 7 `{ date, questsCompleted, xpEarned }` objects, updated on each `completeQuest` call
- AC: Chart uses branch colors for bars: mixed color if multiple branches done that day
- AC: Days with zero activity show a flat baseline bar (not empty) — shows the gap visually
- AC: Chart rendered with `react-native-svg` (already installed) — no new dependencies needed

---

## E12 — Streak Animation & Visual Feedback

**As a user, I want my streak counter to animate when I extend it, so that maintaining my streak feels like a meaningful achievement.**

- AC: When `streak` increments in `userStore`, the flame icon (🔥) in home header plays a scale-bounce animation via `Reanimated`
- AC: Streak number does a count-up animation from previous value to new value over 600 ms
- AC: At milestone streaks (7, 14, 30 days), a short toast pops: "🔥 7-Day Streak! Keep it up!"
- AC: Toast slides in from top, stays 2.5 s, slides out — implemented as an overlay in home `index.tsx`
- AC: Haptic medium impact fires on streak increment
- AC: If streak is at risk (last active = yesterday and user opens app after 8 PM), a subtle pulsing red border appears on the streak badge in home header

---
