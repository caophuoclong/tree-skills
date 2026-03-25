# Quest Detail Screen — Enhancement Plan

## Current State

The screen shows:
- Quest title + meta row (branch, difficulty, duration, XP)
- Static "Why this matters" text (hardcoded per branch — same text for every quest)
- Static step list (hardcoded per branch/difficulty — same steps for every quest)
- Static resource links (placeholder URLs, not real)
- Complete button + skip link

**Core problems:**
1. Steps and "why" text are generic — the same for every career/easy quest, unrelated to the actual quest title/description
2. No interaction beyond the complete button
3. Completed quests look identical to pending ones
4. No context about where this quest fits in the user's journey
5. No way to record what the user actually did

---

## 1. Fix Quest Content (Foundation — must do first)

### Problem
`QUEST_STEPS` and `WHY_TEXT` are static maps keyed by `branch_difficulty`. A quest titled "Viết CV xin việc" shows the exact same steps as "Gửi 1 email kết nối" — both are `career_easy`. The description from the DB is never shown.

### Fix
- Show `quest.description` as the primary body text (it's already fetched, just unused)
- Replace hardcoded `WHY_TEXT` with a short motivational line generated per quest or derived from the quest's node title
- Replace hardcoded `QUEST_STEPS` with steps parsed from `quest.description` (use line breaks or bullet patterns if present), falling back to generic steps only if the description is a single sentence

### Data Needed
No DB changes — `quest.description` already exists.

---

## 2. Progress Context Bar

### Problem
Users don't know why they're doing this quest or how it fits into their growth.

### Solution
A thin progress strip just below the title card:

```
Kỹ năng: Xây dựng thương hiệu cá nhân
Node tiến độ: ████████░░  4/6 quests
```

- Shows the node title this quest belongs to (`quest.node_id → skill_nodes.title`)
- Shows how many quests in that node are completed / total
- Tapping it navigates to the node detail screen

### UI
- Minimal row, 2 lines max
- Branch color as accent
- Chevron icon on the right to indicate it's tappable

### Data Needed
- `quest.node_id` already exists
- Query `user_skill_nodes` for progress on that node (already fetched in `skillTreeStore`)

---

## 3. Focus Timer Mode

### Problem
Users start a quest then forget about it. No structure for actually doing the work.

### Solution
A countdown timer that the user starts before working.

### Flow
```
User taps [Bắt đầu tập trung ▶]
  │
  ▼
Timer starts (duration_min from quest, e.g. 15:00)
  │
  ├─ Minimal UI during focus: big timer, branch color background
  ├─ Soft vibration at halfway point
  └─ Timer ends → ✅ Mark Complete button pulses
```

### Rules
- Timer is optional — user can still complete without starting it
- Completing via timer gives a small "+5 XP Focus Bonus" label (no actual extra XP required, just feels rewarding)
- Pausing is allowed — timer state stored in local component state
- No ambient sounds in v1 (complexity not worth it yet)

### UI
- Button below the steps section: `▶ Bắt đầu tập trung · 15 phút`
- During timer: fullscreen overlay with branch color, large MM:SS countdown, tap to minimize back to quest detail
- Timer keeps running in background when minimized

### Data Needed
- None — purely local state

---

## 4. Completion State — Rich Feedback

### Problem
When a quest is completed, the screen looks the same as before. The complete button becomes disabled but nothing else changes. Users feel no satisfaction.

### Solution
On completion:

**Immediate (0–500ms):**
- Complete button transforms: ✅ `HOÀN THÀNH!` with branch color fill
- XP badge animates up: `+75 XP` floating text
- Streak note appears if applicable: `🔥 Streak 8 ngày`

**After 1.2s (before auto-navigate back):**
- Show a "What's next" strip:
  ```
  ✅ Bước 4/6 trong node này
  → Quest tiếp theo: "Tối ưu hóa mô tả kinh nghiệm"  [Xem →]
  ```

### UI
- Completed state: title card gets a checkmark overlay, opacity slightly reduced
- "Bỏ qua hôm nay" link replaced with "Xem quest tiếp theo →"
- Auto-navigate back delay increases to 2.5s when "What's next" strip is visible

### Data Needed
- Query next incomplete quest from the same node to show in "What's next"

---

## 5. Reflection Note (Optional, 1 tap)

### Problem
The app tracks quest completion but captures no qualitative data. Users can't record what they actually did or learned.

### Solution
After completion, a one-tap expandable note input appears:

```
💭 Ghi lại điều bạn học được hôm nay (không bắt buộc)
[________________________ tap to write ___________]
[Lưu ghi chú]
```

- Collapsed by default — tapping the row expands a text input
- Max 280 characters
- If saved, appears as a small quote block next time the user views this quest

### Rules
- Entirely optional — dismissible with one tap outside
- No mandatory before completing
- Stored locally only in v1 (no DB table needed yet); add `user_quest_notes` table in v2

---

## 6. Completed Quest View

### Problem
When a user opens a quest they already completed, the screen still shows "Mark Complete" (disabled). There's no acknowledgment of what they did or when.

### Solution
Completed quests show a different layout:

```
✅ Hoàn thành lúc 14:32 · Thứ Ba 18/03

[Reflection note if saved]

──────────────────────────────
Tiến độ node: 4/6 quests · 67%

[Xem node →]   [Làm quest khác →]
```

- Header tint changes to `✅ HOÀN THÀNH` instead of branch label
- Footer replaces complete button with two CTAs:
  - "Xem node →" — navigates to node detail
  - "Làm quest khác →" — goes back to quests list
- XP earned shown: `+75 XP đã nhận`

---

## 7. Real Resources (Replace Placeholders)

### Problem
Current resource URLs are fake (`resources.io/templates`, `linkedin.com/learning` hardcoded). Tapping them does nothing.

### Solution
Two phases:

**Phase 1 (no DB changes):**
- Keep the resource section but only show it for quests that have real, hand-curated links
- Add a `resources` JSON field to the `quests` table: `[{ label: string, url: string }]`
- Edge function `generate-quests` can populate this with real URLs based on the quest topic
- If `quest.resources` is empty, hide the section entirely (no fake links)

**Phase 2:**
- Tapping a resource link opens `Linking.openURL()` in the native browser
- Add an external link icon to signal it leaves the app

### Data Needed
- New column: `quests.resources jsonb default '[]'`

---

## 8. XP & Stamina Preview

### Problem
Users don't understand the stamina system. They don't know what XP they'll earn until after completing.

### Solution
In the title card, show the actual XP they'll earn given current stamina:

```
┌─────────────────────────────────────────┐
│ Viết CV xin việc                        │
│ ⏱ 15 phút  · 💼 Career  · ⭐ Medium   │
│                                         │
│ 💰 +75 XP   (⚡ -25% → +56 XP thực)   │
└─────────────────────────────────────────┘
```

- If stamina is full: show `+75 XP` normally
- If stamina warning: show `+75 XP → +56 XP` with a small debuff note
- If wellbeing quest: show `+60 XP · ⚡ +15 stamina` (restore bonus)

### Data Needed
- None — stamina and XP reward already available in the screen

---

## Priority

| Priority | Feature | Effort | Impact |
|---|---|---|---|
| P0 | Fix quest content (real description + steps) | Low | High |
| P0 | Completion state — rich feedback | Medium | High |
| P0 | XP & Stamina preview in title card | Low | Medium |
| P1 | Progress context bar (node progress) | Low | High |
| P1 | Completed quest view | Medium | Medium |
| P2 | Focus timer mode | Medium | High |
| P2 | Real resources (DB column + Linking) | Medium | Medium |
| P3 | Reflection note | Medium | Low |

---

## Implementation Order

1. **Fix quest content** — show `quest.description`, remove hardcoded static maps
2. **XP preview** — 1 formula change in the title card
3. **Progress context bar** — read from `skillTreeStore`, 1 new UI row
4. **Completion state** — update `QuestCompleteButton` and post-complete view
5. **Completed quest view** — conditional render based on `isCompleted`
6. **Focus timer** — new local state + timer overlay component
7. **Resources** — DB migration + `Linking.openURL`
8. **Reflection note** — input + AsyncStorage persistence
