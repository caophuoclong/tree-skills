# Feature Requests v3 — Deep Retention & In-App Experience

## Design Principles

1. **Keep users inside** — Every feature must complete its loop inside the app. No redirects, no external sharing required to get value.
2. **Reduce friction on low-motivation days** — The biggest drop-off is when users feel overwhelmed. Make it easier to do *something* rather than nothing.
3. **Make progress feel real** — Users should feel their skill tree growing, not just numbers going up.
4. **Respect the user's time and energy** — Show users what matters most *right now*, not everything at once.
5. **Forgive, don't punish** — Streak loss and missed days are the #1 reason users quit. The app should recover gracefully.

---

## 1. Quick Quest Mode (5-min Rescue)

### Problem
When users open the app but feel low energy, they see a full quest list and close the app. They needed *permission* to do less.

### Solution
A dedicated "Quick Mode" that surfaces only the shortest, easiest quest available.

### Flow
```
Home Screen
  │
  ├─ User taps "Làm nhanh 5 phút ⚡" banner
  │
  ▼
Quick Quest Screen
  │
  ├─ ONE quest shown (difficulty: easy, duration: 5 min)
  ├─ Branch: auto-selected based on today's activity (weakest branch first)
  ├─ Prominent "Mark Complete" button — no detail screen required
  └─ After completion → mini celebration + option to do another
```

### Rules
- Always shows `duration_min = 5` AND `difficulty = easy`
- Favors branches the user hasn't touched today
- If no 5-min quests exist → show medium-difficulty quest with message "Cố lên 15 phút thôi!"
- Counts toward streak maintenance

### UI
- Floating `⚡ Làm nhanh` banner on the home screen when user has 0 quests completed today
- Banner disappears once at least 1 quest is done
- Shows estimated time: "Chỉ mất 5 phút"

---

## 2. Daily Mood Check-in

### Problem
The app presents the same experience regardless of how the user feels. On hard days, users skip everything.

### Solution
A 3-tap mood check-in at session start that adjusts the day's quest recommendations.

### Flow
```
App opens (first time each day)
  │
  ▼
Mood Check Screen (appears as a modal, dismissible)
  │
  ├─ "Hôm nay bạn cảm thấy thế nào?"
  ├─ 5 emoji options: 😴 😞 😐 😊 🔥
  │
  ▼
Quest list adapts:
  │
  ├─ 😴 / 😞  → Show only easy quests, hide hard, promote wellbeing quests first
  ├─ 😐       → Normal daily mix
  └─ 😊 / 🔥  → Show full list, promote harder quests, show streak bonus multiplier
```

### Data
- Store mood in `daily_stats.mood_start` (add column)
- Use mood to compute `recommended_difficulty` for the day
- No mandatory — always dismissible in 1 tap

### Display
- If user is 😴/😞, show a warm message: "Hôm nay chỉ cần làm 1 nhiệm vụ thôi 💙"
- If user is 🔥, show energy message: "Streak multiplier đang hoạt động! 🔥"

---

## 3. Streak Recovery System

### Problem
Users who break a streak often quit entirely. Losing a 14-day streak feels catastrophic. There's no reason to continue.

### Solution
Replace "streak lost" with a forgiving recovery mechanic.

### Mechanics

**Grace Day**
- Missing 1 day does NOT immediately break the streak
- The next day, user sees: "Streak ơi ngủ quên hôm qua 😅 — hoàn thành 2 nhiệm vụ hôm nay để cứu streak!"
- Completing 2 quests that day = streak continues as if nothing happened
- Maximum 1 grace day allowed per 7-day period

**Streak Rebuild Bonus**
- After actually breaking a streak, user gets a "Comeback XP bonus"
- Completing 3 quests on comeback day = +50 bonus XP + "🔄 Comeback!" badge flash
- Shows motivational message: "Quay lại mạnh hơn 💪"

**Streak Milestone Preview**
- When user is 1–3 days away from a streak milestone (7, 14, 30 days), show a persistent banner:
  ```
  🔥 Còn 2 ngày nữa là streak 14 ngày! Đừng bỏ cuộc nhé
  ```

---

## 4. Habit Heatmap (Activity Calendar)

### Problem
Users can't visualize their long-term progress. Numbers like "total XP" feel abstract. There's no satisfying evidence of consistency.

### Solution
A GitHub-style contribution heatmap showing daily quest completions.

### Display
```
     T2  T3  T4  T5  T6  T7  CN
W1   ■   ■   □   ■   ■   ■   □
W2   ■   ■   ■   ■   □   ■   ■
W3   □   ■   ■   ■   ■   ■   ■
W4   ■   ■   □   ■   ■   ■   ■
```

- Dark square = 3+ quests completed
- Medium square = 1–2 quests
- Empty = no activity
- Branch colors: tapping a square shows the branch breakdown for that day
- 4-week view by default, scrollable to 12 weeks

### Location
- Profile screen, below the stats row
- Tapping a day shows: "Ngày X/X — Y nhiệm vụ hoàn thành — +Z XP"

### Why it works
- Creates a "don't break the chain" psychological pressure
- Makes long-term consistency visible and satisfying
- No external sharing needed — the satisfaction is internal

---

## 5. Personalized Daily Brief

### Problem
The home screen dumps all information at once. Users don't know what to focus on.

### Solution
A "Good morning" brief that shows the most important 3 things for today.

### Content (auto-generated each day)
```
Chào buổi sáng, [Tên]! ☀️

Hôm nay bạn có:
• 4 nhiệm vụ đang chờ
• 🔥 Streak ngày thứ 8 — milestone 14 ngày còn 6 ngày nữa
• 💼 Career cần thêm 2 quest để lên tier

[Bắt đầu ngày →]
```

### Rules
- Shows once per day (first open)
- Appears as a card at the top of the home screen, dismissible
- Content priority:
  1. Streak milestone if within 3 days
  2. Weekly challenge deadline if within 2 days
  3. Most neglected branch
  4. Total pending quests
- Auto-dismissed after user completes first quest

---

## 6. Quest Bookmarks / "Do Later" List

### Problem
Users encounter quests they want to do but not right now. They tap away and forget them. No way to save for later.

### Solution
A bookmark button on each quest that saves it to a personal list.

### Flow
- Long-press on a `QuestItem` → bookmark option appears
- Or: in the quest detail screen, a bookmark icon in the header
- Bookmarked quests appear in a "Để sau" (Later) section on the quests screen (collapsible, below the main list)
- Bookmarks persist across days until the quest is completed or removed

### Data
- New column: `user_quests.bookmarked: boolean` (default false)
- Or a separate `user_quest_bookmarks` table if keeping `user_quests` clean

### UI
- Bookmark icon: `Ionicons bookmark-outline` / `bookmark`
- Counter badge on quests tab: shows pending + bookmarked count
- "Để sau" section header shows count: "Để sau (3)"

---

## 7. Contextual Quest Recommendations

### Problem
The daily quest list is static and doesn't respond to context. A user opening the app at 11pm for 5 minutes gets the same list as someone with 2 hours on a Sunday morning.

### Solution
Smart quest reordering (not filtering) based on context signals.

### Context Signals
| Signal | Action |
|--------|--------|
| Time: after 9pm | Move wellbeing/easy quests to top |
| Time: before 8am | Move short duration quests to top |
| Day: weekend | Show harder/longer quests first |
| Streak at risk | Move 5-min quests to top with urgent badge |
| Branch neglected (>3 days) | Add "Cần chú ý" label to that branch's quests |
| Stamina < 30% | Show wellbeing quest with restore indicator |

### Display
- Quests reorder automatically — no user action needed
- A small badge on quests that are contextually recommended: `✦ Gợi ý cho hôm nay`
- No explanation needed in most cases; just feels like the app "gets" the user

---

## 8. Quest Story Chains

### Problem
Individual quests feel disconnected. Completing "Optimize LinkedIn profile" has no narrative link to the next career quest. There's no story momentum.

### Solution
Linked quest chains where completing quest A unlocks a follow-up B with a continuation story.

### Structure
```
Quest Chain: "Xây dựng thương hiệu cá nhân"

Quest 1: "Cập nhật ảnh đại diện LinkedIn"
  → Completion unlocks:
Quest 2: "Viết phần giới thiệu 3 câu"
  → Completion unlocks:
Quest 3: "Gửi 1 lời mời kết nối có tin nhắn"
```

### Display
- In quest detail screen: "Phần 1/3 — Xây dựng thương hiệu cá nhân"
- After completing: animated unlock of next quest in chain
- Chain progress visible in node detail: "Chain: 1/3 hoàn thành"

### Data
- New column: `quests.chain_id` (nullable) and `quests.chain_order`
- No new tables needed

---

## 9. Weekly Review Screen

### Problem
Users who take a break don't know what they missed or what they accomplished. There's nothing that says "you did well this week."

### Solution
An end-of-week (Sunday evening) or start-of-next-week summary screen.

### Content
```
Tuần này của bạn 🌟

✅ 12 nhiệm vụ hoàn thành
🔥 Streak duy trì 7 ngày
⬆️  Lên cấp 5
💼 Career tiến bộ nhất: +3 quests

So với tuần trước:
• Nhiệm vụ: 12 vs 8 (+50%) ⬆️
• XP: 275 vs 200 (+38%) ⬆️

Tuần tới:
• Streak milestone: ngày 14 🎯
• Career tier 2 cần 2 quest nữa
```

### Trigger
- Shows as a modal/overlay on first app open of the new week (Monday)
- Dismissible, but also accessible from Profile screen anytime
- If user didn't open app all week → skip, just show comeback message

---

## 10. Smart Difficulty Adaptation

### Problem
Users get stuck on hard quests and stop completing. Or they breeze through easy quests and get bored. Neither retains.

### Solution
Automatic difficulty adjustment based on completion patterns.

### Logic
- Track completion rate over last 7 days
- If completion rate < 40%: next auto-assigned quests lean easier
- If completion rate > 90%: next auto-assigned quests lean harder
- Applied to auto-assignment only — user-selected quests stay as-is

### Display
- No explicit difficulty change notification (avoid making users feel judged)
- Internally: weight `easy`/`medium`/`hard` quests in `getDaily` based on this rate

### Implementation
- Add `completion_rate_7d` to `profiles` table, updated by trigger after each completion
- `getDaily` reads this field and adjusts the query weights

---

## 11. In-App Notifications (Local Push)

### Problem
Users forget the app exists between sessions. External push notifications are often disabled. The app needs to create its own re-engagement loop.

### Solution
In-app notification center (already exists) combined with local scheduled push notifications.

### Local Notification Types

**Streak At Risk** (8pm if no activity today)
> "🔥 Streak ngày {N} hết hạn trong 4 tiếng. Làm 1 quest để cứu nhé!"

**Daily Morning Nudge** (8am, only if user usually opens at this time)
> "☀️ Chào {Tên}! {N} nhiệm vụ đang chờ hôm nay."

**Streak Milestone Tomorrow** (8pm the day before hitting 7/14/30)
> "🎯 Ngày mai là streak ngày {N}! Đừng bỏ lỡ milestone này."

**Weekly Review Ready** (Monday 9am)
> "📊 Tuần vừa rồi của bạn: {N} quests, {X} XP. Xem chi tiết →"

### Rules
- Max 1 notification per day
- Use `expo-notifications` (already in Expo SDK, no new install)
- User can configure which types to receive in Settings
- No notifications before 8am or after 9pm

---

## 12. Seamless Offline Mode

### Problem
The app fails silently when there's no network. Users who try to complete quests offline see nothing happen or get errors. They close the app.

### Solution
Optimistic completion that queues to sync when online.

### Mechanics
- Quest completion always updates local Zustand store immediately (already does this)
- If `questService.complete` fails due to network → add to a local queue
- Queue stored in AsyncStorage
- When app regains connectivity → flush queue
- User never sees a failure — quest is marked complete in UI regardless

### Display
- Small sync indicator when queue has pending items: `☁️ Đồng bộ đang chờ...`
- Disappears when synced
- No error modals, no blocking UI

### Data
- New store: `syncQueue: QueuedCompletion[]` in Zustand + AsyncStorage
- `QueuedCompletion = { questId, xpEarned, timestamp }`

---

## 13. Branch Focus Week

### Problem
Users spread attention thin across all 4 branches and feel like nothing is progressing fast. No momentum in any direction.

### Solution
A voluntary "Focus Week" where one branch is prioritized with bonus incentives.

### Flow
```
Settings / Home Screen
  │
  ├─ User taps "Chọn Focus tuần này"
  ├─ Picks one branch: Career / Finance / Softskills / Wellbeing
  │
  ▼
For 7 days:
  ├─ Focus branch quests appear first in the list
  ├─ +20% bonus XP for focus branch quests
  ├─ Home screen shows focus branch progress ring highlighted
  └─ End of week → summary of branch progress made
```

### Rules
- Can only set once per week (Monday to Sunday)
- Not mandatory — "No focus" is the default
- Focus branch quests marked with `🎯 Focus` badge

---

## Priority v3

| Priority | Feature | Retention Impact | Why Now |
|----------|---------|-----------------|---------|
| P0 | Quick Quest Mode (5-min rescue) | ⬆️⬆️⬆️ | Prevents abandonment on low-energy days |
| P0 | Streak Recovery System | ⬆️⬆️⬆️ | Streak loss is #1 quit trigger |
| P0 | In-App Notifications (local push) | ⬆️⬆️⬆️ | Re-engagement without leaving the app |
| P1 | Daily Mood Check-in | ⬆️⬆️ | Personalizes experience, reduces mismatch friction |
| P1 | Habit Heatmap | ⬆️⬆️⬆️ | Makes consistency visible and addictive |
| P1 | Personalized Daily Brief | ⬆️⬆️ | Focuses attention, reduces decision fatigue |
| P1 | Weekly Review Screen | ⬆️⬆️ | Re-engages lapsed users with positive framing |
| P2 | Quest Bookmarks | ⬆️⬆️ | Reduces friction for intentional users |
| P2 | Contextual Quest Recommendations | ⬆️⬆️ | Makes app feel smart and personal |
| P2 | Smart Difficulty Adaptation | ⬆️⬆️ | Keeps challenge in the sweet spot |
| P2 | Branch Focus Week | ⬆️⬆️ | Creates weekly momentum and purpose |
| P3 | Quest Story Chains | ⬆️⬆️ | Narrative momentum, higher completion rate |
| P3 | Seamless Offline Mode | ⬆️ | Removes a hard drop-off point |
