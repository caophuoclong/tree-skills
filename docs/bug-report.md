# Bug Report & Fixes — Life Skills App

## Table of Contents
1. [Splash Screen Error](#1-splash-screen-error)
2. [Quest Completion Not Updating UI](#2-quest-completion-not-updating-ui)
3. [Streak Not Updating](#3-streak-not-updating)
4. [XP Level-Up Not Triggering](#4-xp-level-up-not-triggering)
5. [XP Display Bug (70/30)](#5-xp-display-bug-7030)
6. [Skill Node Dependencies Not Updating](#6-skill-node-dependencies-not-updating)
7. [Skill Tree Rendering Issues](#7-skill-tree-rendering-issues)
8. [Daily Bonus Not Updating Streak](#8-daily-bonus-not-updating-streak)
9. [Daily Bonus XP Not Persisted to DB](#9-daily-bonus-xp-not-persisted-to-db)
10. [Quest Completion Silent Failure (completed_at)](#10-quest-completion-silent-failure-completed_at)
11. [Duplicate user_quests Rows](#11-duplicate-user_quests-rows)
12. [Level Up Modal Freeze](#12-level-up-modal-freeze)
13. [Quest List Not Updating After Completion](#13-quest-list-not-updating-after-completion)
14. [Home Screen Not Removing Completed Quests](#14-home-screen-not-removing-completed-quests)
15. [Quest Screen Strikethrough](#15-quest-screen-strikethrough)
16. [XP History Not Used for Computation](#16-xp-history-not-used-for-computation)

---

## 1. Splash Screen Error

**Symptom:**
```
Error: No native splash screen registered for given view controller.
Call 'SplashScreen.show' for given view controller first.
```

**Root Cause:**
`SplashScreen.hide()` in `app/_layout.tsx` was called multiple times during re-renders (when `isDataLoading` changed). Expo's native splash screen can only be hidden once.

**Fix:**
Added a `useRef` guard to ensure `SplashScreen.hide()` is called only once.

**File:** `app/_layout.tsx`

```ts
const splashHidden = useRef(false);

useEffect(() => {
  if (fontsLoaded && !isDataLoading && !splashHidden.current) {
    splashHidden.current = true;
    SplashScreen.hide();
  }
}, [fontsLoaded, isDataLoading]);
```

---

## 2. Quest Completion Not Updating UI

**Symptom:**
After completing a quest, the progress ring, quest list, and XP didn't update on the home screen.

**Root Cause:**
Query cache wasn't invalidated after quest completion. The React Query cache held stale data.

**Fix (initial):**
Added `queryClient.invalidateQueries()` after `questService.complete()` succeeds.

**Fix (final):**
Removed query invalidation entirely. The local Zustand store is the single source of truth. Query invalidation was causing race conditions where the backend hadn't committed yet, and a refetch returned old data that overwrote the local store.

**File:** `src/business-logic/hooks/useQuestManager.ts`

---

## 3. Streak Not Updating

**Symptom:**
Completing a quest didn't increment the streak counter.

**Root Cause:**
`recordActivity()` from `useGrowthStreak` was called, but it had a stale closure over `streak` and `lastActive` from the Zustand store. The streak was never persisted to the DB after quest completion.

**Fix:**
Moved streak increment logic directly into `completeQuest()` in `useQuestManager.ts`. On first activity of the day:
- If `last_active_date === yesterday` → `streak++`
- Otherwise → `streak = 1`
- Persists `{ streak, best_streak, last_active_date }` via `userService.update()`

**File:** `src/business-logic/hooks/useQuestManager.ts`

---

## 4. XP Level-Up Not Triggering

**Symptom:**
User had enough total XP to level up, but the level stayed the same.

**Root Cause:**
Multiple issues:
1. `updateXP()` in `userStore.ts` only incremented `current_xp_in_level` without recalculating the level
2. Profile load from DB trusted `level`, `current_xp_in_level`, `xp_to_next_level` values instead of computing them from `total_xp`
3. Login bonus XP was never persisted to the DB

**Fix:**
1. `updateXP()` now calls `computeLevel(user.total_xp + amount)` to recalculate level
2. `useAuth.fetchProfile()` now calls `computeLevel(data.total_xp)` instead of trusting DB values
3. `userService.getMe()` and `userService.update()` both recompute level from `total_xp`
4. Login bonus now persists XP to profiles table

**Files:**
- `src/business-logic/stores/userStore.ts` — `updateXP` fix
- `src/business-logic/auth/useAuth.ts` — profile load fix
- `src/business-logic/api/services/userService.ts` — `getMe()` and `update()` fix

---

## 5. XP Display Bug (70/30)

**Symptom:**
XP display showed "70/30 XP" — current XP exceeded the target XP needed for next level.

**Root Cause:**
`updateXP()` (used by login bonus) added XP to `current_xp_in_level` without checking if it exceeded `xp_to_next_level`. Login bonus XP was never persisted to DB, so on reload the values were inconsistent.

**Fix:**
1. `updateXP()` now uses `computeLevel()` (fixes the calculation)
2. Login bonus persists XP to DB
3. `useHomeScreen` clamps `currentXP ≤ targetXP` for display
4. `SkillsSection` uses `Math.max(0, ...)` for "XP until next level" text

**Files:**
- `src/business-logic/stores/userStore.ts`
- `src/business-logic/hooks/useHomeScreen.ts`
- `src/ui/organisms/SkillsSection.tsx`

---

## 6. Skill Node Dependencies Not Updating

**Symptom:**
After onboarding generated new skill nodes, the `skill_node_dependencies` table had no entries for them. Nodes appeared locked even though their prerequisites were met.

**Root Cause:**
`generate_tier_dependencies()` was only called once during migration. When the onboarding-generate edge function created new nodes, no dependencies were generated for them.

**Fix:**
Added `rpc("generate_tier_dependencies")` call after inserting new skill nodes in the edge function.

**File:** `supabase/functions/onboarding-generate/index.ts`

---

## 7. Skill Tree Rendering Issues

**Symptom:**
- Not enough nodes shown
- Nodes in incorrect positions within tiers
- Nodes didn't start from the correct position in each tier

**Root Cause:**
1. Tree layout only sorted by `tier`, not by `tier_order`
2. Zigzag position (`posIdx`) wasn't reset between tiers
3. `get_unlocked_nodes` RPC didn't return `tier_order`
4. `SkillNode` type didn't include `tier_order`

**Fix:**
1. Added `tier_order?: number` to `SkillNode` type
2. Updated `get_unlocked_nodes` RPC to return `tier_order`
3. Updated `skillTreeService` to map `tier_order` in both RPC and manual fallback
4. Updated `buildTreeLayout` to sort by `(tier, tier_order)` and reset `posIdx` per tier

**Files:**
- `src/business-logic/types/index.ts`
- `supabase/migrations/20260321000024_fix_get_unlocked_nodes.sql`
- `src/business-logic/api/services/skillTreeService.ts`
- `src/hooks/useTreeLayout.ts`

---

## 8. Daily Bonus Not Updating Streak

**Symptom:**
Claiming the daily login bonus didn't increment the streak.

**Root Cause:**
`checkDailyLogin()` in `userStore.ts` only read the streak to calculate bonus XP but never incremented it. The streak was never updated on login.

**Fix (attempted):**
Added streak increment logic to `checkDailyLogin()` — compared `last_active_date` with yesterday to determine if consecutive.

**Fix (reverted):**
Moved streak increment to quest completion instead. `checkDailyLogin()` now only shows the bonus modal based on current streak. Streak increments when the user actually completes a quest (first activity of the day).

**File:** `src/business-logic/stores/userStore.ts`

---

## 9. Daily Bonus XP Not Persisted to DB

**Symptom:**
Login bonus XP was added to the local store but never saved to the database. On app reload, the XP was lost.

**Root Cause:**
`dailyBonusService.recordBonus()` only inserted into `daily_bonuses` table. It never updated `profiles.total_xp` or inserted into `xp_history`.

**Fix:**
1. `dailyBonusService.recordBonus()` now also inserts into `xp_history` (DB trigger auto-updates profiles)
2. `LoginBonusModal.handleClaim()` now calls `userService.update()` to persist XP

**Files:**
- `src/business-logic/api/services/dailyBonusService.ts`
- `src/ui/molecules/LoginBonusModal.tsx`

---

## 10. Quest Completion Silent Failure (completed_at)

**Symptom:**
Clicking "Mark Complete" showed the quest as completed in the UI, but `user_quests.completed_at` was null in the database. The `xp_history` was updated, and stamina/XP were deducted, but the quest wasn't marked complete.

**Root Cause:**
Two issues:
1. `user_quests` schema had `completed_at timestamptz default now()` — when onboarding-generate inserted rows, `completed_at` defaulted to the current timestamp instead of null
2. The `.is("completed_at", null)` filter in the update query didn't match any rows because `completed_at` was never null
3. Supabase's `.update()` with a filter that matches 0 rows returns `{ error: null }` — no error thrown, function continues to `xp_history.insert()`

**Fix:**
1. Created migration to fix `completed_at` default from `now()` to `null`
2. Added `.select()` after `.update()` to verify rows were affected
3. Added check: if `updated.length === 0`, throw "Quest not found or already completed"

**Files:**
- `src/business-logic/api/services/questService.ts`
- `supabase/migrations/20260321000026_user_quests_unique_constraint.sql`

---

## 11. Duplicate user_quests Rows

**Symptom:**
`user_quests` table had duplicate rows for the same `user_id` + `quest_id` combination.

**Root Cause:**
No unique constraint on `(user_id, quest_id)`. The onboarding-generate function used `.insert()` which created duplicates if called multiple times.

**Fix:**
1. Migration to clean up existing duplicates (keep latest by `id`)
2. Added `UNIQUE (user_id, quest_id)` constraint
3. Changed onboarding-generate to use `.upsert()` with `onConflict: "user_id,quest_id"` and `ignoreDuplicates: true`

**Files:**
- `supabase/migrations/20260321000026_user_quests_unique_constraint.sql`
- `supabase/functions/onboarding-generate/index.ts`

---

## 12. Level Up Modal Freeze

**Symptom:**
When leveling up, the app froze and the level-up celebration modal didn't appear.

**Root Cause:**
1. `ConfettiOverlay` created 28 particles with 28 `Animated.Value` instances — too many simultaneous animations blocked the JS thread
2. `setLevelUpReward()` was called on the quest/[id] screen, but `router.back()` navigated away before the modal could render

**Fix:**
1. Reduced `PARTICLE_COUNT` from 28 to 15 in `ConfettiOverlay`
2. Deferred `setLevelUpReward()` by 1500ms (matches `router.back()` delay) so the modal shows AFTER navigating back to the home screen

**Files:**
- `src/ui/atoms/ConfettiOverlay.tsx`
- `src/business-logic/hooks/useXPEngine.ts`

---

## 13. Quest List Not Updating After Completion

**Symptom:**
After completing a quest, the quest list still showed the old uncompleted quest. Clicking on it opened the modal with "Mark Complete" still available.

**Root Cause:**
1. Query invalidation was removed (to fix race conditions), but the local store update didn't propagate to the quest list
2. `QuestPreviewSection` showed ALL quests including completed ones

**Fix:**
1. `QuestPreviewSection` now filters `quests` to only show `completed_at === null`
2. Home screen and quests screen use `useFocusEffect` to force re-render when gaining focus

**Files:**
- `src/ui/organisms/QuestPreviewSection.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/quests.tsx`

---

## 14. Home Screen Not Removing Completed Quests

**Symptom:**
Completed quests remained visible on the home screen after the quest modal closed.

**Root Cause:**
React Navigation caches screens. When the quest modal closed, the home screen didn't re-render even though the Zustand store had been updated.

**Fix:**
Added `useFocusEffect` with a tick counter to force re-render when the screen gains focus:

```ts
const [, setTick] = useState(0);
useFocusEffect(useCallback(() => { setTick((t) => t + 1); }, []));
```

**File:** `app/(tabs)/index.tsx`

---

## 15. Quest Screen Strikethrough

**Symptom:**
User wanted completed quests to remain visible on the quests screen with a strikethrough effect instead of being hidden.

**Root Cause:**
The quests screen was filtering out completed quests with `pendingQuests.map(...)`.

**Fix:**
Changed the quests screen to show ALL quests (`quests.map(...)`). The `QuestItemComponent` already had `textDecorationLine: 'line-through'` styling for completed quests, so the strikethrough effect was already implemented.

**File:** `app/(tabs)/quests.tsx`

---

## 16. XP History Not Used for Computation

**Symptom:**
XP was stored in `xp_history` but the `profiles` table XP/level values were computed client-side and pushed directly, creating inconsistency between the two.

**Root Cause:**
Client-side code computed XP locally and pushed to `profiles` table via `userService.update()`. The `xp_history` table was only used for logging, not as the source of truth.

**Fix:**
1. Created `recalc_user_xp()` DB function that computes `total_xp`, `level`, `current_xp_in_level`, `xp_to_next_level` from `xp_history`
2. Created trigger `xp_history_after_insert` that auto-calls `recalc_user_xp()` on every `xp_history` insert
3. Updated `dailyBonusService.recordBonus()` to insert into `xp_history`
4. Removed manual XP profile updates from `useQuestManager` and `LoginBonusModal` — the DB trigger handles it
5. Client-side `addXP()` still updates local store for immediate UI feedback

**Files:**
- `supabase/migrations/20260321000025_xp_recalc_from_history.sql`
- `src/business-logic/api/services/dailyBonusService.ts`
- `src/business-logic/hooks/useQuestManager.ts`
- `src/ui/molecules/LoginBonusModal.tsx`

---

## Migrations Summary

| Migration | Description |
|-----------|-------------|
| `20260321000022_onboarding_detail_data_rpc.sql` | RPC function for onboarding detail data |
| `20260321000023_empty_user_data_rpc.sql` | RPC function to reset user data |
| `20260321000024_fix_get_unlocked_nodes.sql` | Add `tier_order` to `get_unlocked_nodes` RPC |
| `20260321000025_xp_recalc_from_history.sql` | XP computation from `xp_history` + trigger |
| `20260321000026_user_quests_unique_constraint.sql` | Fix `completed_at` default + unique constraint |
