# Feature Requests — Life Skills App

## Table of Contents
1. [Quest Selection System](#1-quest-selection-system)
2. [Quest Filtering & Sorting](#2-quest-filtering--sorting)
3. [Additional Feature Ideas](#3-additional-feature-ideas)

---

## 1. Quest Selection System

### Problem

Currently, the app generates quests during onboarding and assigns a fixed daily set. Users have no control over which quests they do each day. With many quests available across skill nodes, the daily experience feels rigid.

### Proposal

Allow users to browse quests by skill node and select which ones to work on today.

### User Flow

```
Home Screen / Skill Tree
  │
  ├─ User taps a skill node
  │
  ▼
Node Detail Screen (already exists: app/node-detail/)
  │
  ├─ Shows all quests for that node
  │  ├─ Quest title, description, difficulty, XP reward
  │  ├─ Completion status (done / available / locked)
  │  └─ "Add to Today" toggle button for available quests
  │
  ├─ User toggles quests ON
  │
  ▼
Quests Screen / Home Screen
  │
  └─ Selected quests appear in today's list
     (up to daily limit based on stamina)
```

### Data Model

No new tables needed. The existing `user_quests` table already tracks everything:

- **`date = today`** → quest is selected for today
- **`completed_at IS NULL`** → quest is pending
- **`completed_at IS NOT NULL`** → quest is done

### Logic

- **Select a quest:** `INSERT INTO user_quests (user_id, quest_id, date, xp_earned)` with `ON CONFLICT DO NOTHING` (unique constraint already exists)
- **Remove from today:** `DELETE FROM user_quests WHERE user_id AND quest_id AND date = today AND completed_at IS NULL`
- **Get today's quests:** `SELECT * FROM user_quests WHERE user_id AND date = today`
- **Get available quests:** All quests from unlocked nodes, excluding those already in `user_quests` for today or ever completed
- **Daily limit:** `SELECT COUNT(*) FROM user_quests WHERE user_id AND date = today` — must be < `dailyLimit(stamina)`
- **Auto-assignment:** If user opens quests screen and has no rows for today, auto-insert the default set (current behavior)

### API Changes

| Function | Description |
|----------|-------------|
| `questService.getForNode(nodeId)` | Get all quests for a skill node |
| `questService.selectForToday(questIds)` | Mark quests as selected for today |
| `questService.getSelectedForToday()` | Get today's selected quests |
| `questService.removeFromToday(questId)` | Remove a quest from today's selection |

### UI Changes

**Node Detail Screen:**
- Show each quest with an "Add to Today" button (toggle)
- Show count: "3/5 selected for today"
- Greyed out if daily limit reached

**Quests Screen:**
- Show a "Browse Nodes" button that navigates to the skill tree
- Quests marked as selected for today appear in the daily list

**Home Screen:**
- No change needed — already shows today's quests from the store

---

## 2. Quest Filtering & Sorting

### Problem

The quests screen shows only today's quests with no way to browse the full quest catalog, filter by difficulty, or see completed history.

### Proposal

Add a filter bar to the quests screen with multiple filter options.

### Filter Options

| Filter | Options | Description |
|--------|---------|-------------|
| **Time** | Today / This Week / All Time | Show quests from different time ranges |
| **Status** | All / Available / Completed / Locked | Filter by completion and availability |
| **Difficulty** | All / Easy / Medium / Hard | Filter by difficulty level |
| **Branch** | All / Career / Finance / Soft Skills / Wellbeing | Filter by skill branch |
| **Sort** | Newest / XP (high→low) / Duration (short→long) / Difficulty | Sort order |

### UI Mockup

```
┌─────────────────────────────────────────┐
│  Nhiệm vụ                    [Filter ▼] │
├─────────────────────────────────────────┤
│  [Today] [Week] [All]                   │
│  [All] [Available] [Done] [Locked]      │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │ 💼 SỰ NGHIỆP    DỄ             │    │
│  │ Tối ưu hồ sơ LinkedIn          │    │
│  │ +25 XP  •  5 phút               │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 💼 SỰ NGHIỆP    TRUNG BÌNH     │    │
│  │ Viết bài blog chuyên ngành      │    │
│  │ +25 XP  •  15 phút              │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 🧘 SỨC KHỎE     DỄ      ✓ Done │    │
│  │ Thiền 5 phút buổi sáng          │    │
│  │ +10 XP  •  5 phút               │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Implementation

**Filter state:**
```ts
interface QuestFilters {
  timeRange: 'today' | 'week' | 'all';
  status: 'all' | 'available' | 'completed' | 'locked';
  difficulty: 'all' | Difficulty;
  branch: 'all' | Branch;
  sortBy: 'newest' | 'xp_desc' | 'duration_asc' | 'difficulty';
}
```

**Data source for "All Time" filter:**
- Query `user_quests` joined with `quests` for the user, ordered by date
- Show completion status from `user_quests.completed_at`
- Show XP earned from `user_quests.xp_earned`

**Data source for "Available" filter:**
- Query all quests from unlocked skill nodes
- Exclude quests already completed
- Exclude quests from locked nodes (based on `skill_node_dependencies`)

---

## 3. Additional Feature Ideas

### 3.1 Quest History & Stats

Show a history view with:
- Total quests completed (all time)
- XP earned per day/week/month
- Streak calendar (visual calendar with completed days)
- Most productive branch

**Data source:** `daily_stats` table (already exists)

### 3.2 Quest Recommendations

Based on:
- User's primary branch (from onboarding)
- Current stamina level (suggest wellbeing quests when low)
- Streak risk (suggest easy quests when streak is at risk)
- Branch balance (suggest underrepresented branches)

### 3.3 Quest Scheduling

Allow users to schedule quests for specific days:
- "Do this quest on Monday"
- "Repeat this quest every day this week"
- Insert into `user_quests` with `date = scheduled_day` on the target date

### 3.4 Custom Quests

Let users create their own quests:
- Title, description, difficulty, branch
- XP reward calculated based on difficulty
- Stored in a `user_custom_quests` table
- Appears alongside generated quests

### 3.5 Quest Completion Notes

After completing a quest, allow users to:
- Add a short reflection note
- Rate their experience (1-5)
- Track mood before/after

**Data source:** New column on `user_quests`:
```sql
alter table user_quests add column reflection text;
alter table user_quests add column mood_before int;
alter table user_quests add column mood_after int;
```

### 3.6 Branch Focus Mode

Let users set a "focus branch" for the week:
- Prioritizes quests from that branch in the daily list
- Shows branch-specific progress more prominently
- Bonus XP for completing quests in the focus branch

### 3.7 Quest Sharing / Social

- Share completed quests with friends
- Compare daily progress
- Leaderboard by branch

---

## Priority

| Priority | Feature | Impact |
|----------|---------|--------|
| P0 | Quest Selection from Skill Nodes | Core UX improvement |
| P0 | Quest Filtering (status, difficulty, branch) | Core UX improvement |
| P1 | Quest History & Stats | Engagement |
| P1 | Quest Recommendations | Personalization |
| P2 | Quest Scheduling | Convenience |
| P2 | Custom Quests | User empowerment |
| P3 | Quest Completion Notes | Reflection |
| P3 | Branch Focus Mode | Depth |
| P3 | Social Features | Growth |
