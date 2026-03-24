# Feature Requests v2 — Retention & Virality

## Design Principles

1. **Show, don't tell** — Every achievement should be visually flex-worthy
2. **Fear of missing out** — Daily/weekly time-limited content
3. **Social proof** — Let users see and compare with others
4. **Micro-wins** — Celebrate small actions, not just big milestones
5. **Identity** — Users should feel their profile represents who they are

---

## 1. Streak Showcase

### Concept
The streak is the #1 retention mechanic. Make it impossible to ignore and painful to lose.

### Features

**Streak Fire Animation**
- Streak counter on the home screen has a fire animation that grows with streak length
- Day 1-6: small flame 🔥
- Day 7-29: medium flame 🔥🔥
- Day 30+: massive flame 🔥🔥🔥 with particle effects

**Streak Freeze (already has shields, expand it)**
- Earn streak freezes by completing wellbeing quests
- Can stack up to 3 freezes
- Visual: ice crystal icon next to the fire

**Streak Leaderboard**
- Weekly streak leaderboard among friends or global
- Top 3 get a crown icon 👑 next to their name

**Streak Shame (FOMO)**
- If user is about to lose their streak (it's 11pm, no activity today), show a full-screen warning:
  ```
  🔥 Your 12-day streak dies in 1 hour!
  [Do a 5-min quest to save it →]
  ```

---

## 2. Achievement Badges

### Concept
Collectible badges that users earn and display on their profile. Gen Z loves collecting and showing off.

### Badge Categories

**Streak Badges**
| Badge | Requirement |
|-------|-------------|
| 🌱 Seedling | First day |
| 🔥 On Fire | 7-day streak |
| 💪 Grinder | 30-day streak |
| 👑 Legend | 100-day streak |

**Branch Badges**
| Badge | Requirement |
|-------|-------------|
| 💼 Career Climber | Complete 10 career quests |
| 💰 Money Moves | Complete 10 finance quests |
| 🧘 Zen Master | Complete 10 wellbeing quests |
| 🎤 People Person | Complete 10 soft skills quests |

**XP Badges**
| Badge | Requirement |
|-------|-------------|
| ⚡ First Blood | Earn first 100 XP |
| 🚀 Rocket | Earn 1,000 XP |
| 💎 Diamond | Earn 10,000 XP |

**Special Badges**
| Badge | Requirement |
|-------|-------------|
| 🌙 Night Owl | Complete a quest after midnight |
| 🌅 Early Bird | Complete a quest before 7am |
| 🎯 Perfectionist | Complete all daily quests in one day |
| 🔄 Comeback | Return after 7+ days away |

### Display
- Badges appear on the profile card
- New badge earned → confetti + shareable card
- Badge showcase: pick 3 badges to feature on your profile

---

## 3. Shareable Progress Cards

### Concept
Auto-generated, beautiful shareable images that users post to Instagram/TikTok/Stories.

### Card Types

**Daily Recap Card**
```
┌─────────────────────────┐
│  🌳 Life Skill Tree     │
│                         │
│  Day 12 🔥              │
│  +75 XP earned today    │
│  3/5 quests completed   │
│                         │
│  💼 Career ████████░░ 80%│
│  🧘 Wellbeing ██████░░ 60%│
│                         │
│  Level 4 → Level 5 ⬆️   │
└─────────────────────────┘
```

**Level Up Card**
```
┌─────────────────────────┐
│  🏆 LEVEL UP!           │
│                         │
│  Level 5                │
│  "Getting Serious"      │
│                         │
│  🔥 12-day streak       │
│  💎 1,250 total XP      │
│                         │
│  🌳 Life Skill Tree     │
└─────────────────────────┘
```

**Streak Milestone Card**
```
┌─────────────────────────┐
│  🔥🔥🔥 30 DAYS! 🔥🔥🔥  │
│                         │
│  Top 5% of all users    │
│                         │
│  💼 Career ████████ 80% │
│  💰 Finance ██████ 60%  │
│  🎤 Soft ████████ 75%   │
│  🧘 Wellbeing ████ 40%  │
│                         │
│  🌳 Life Skill Tree     │
└─────────────────────────┘
```

### Implementation
- Use `react-native-view-shot` to capture a React component as an image
- Use `expo-sharing` to share to native share sheet
- Card design uses the app's NeoBrutalism style
- Auto-generate after level up, streak milestone, or daily completion

---

## 4. Weekly Challenges

### Concept
Time-limited challenges that reset every Monday. Creates FOMO and gives users a reason to come back weekly.

### Challenge Types

**Branch Challenges**
- "Complete 5 Career quests this week" → +100 bonus XP
- "Complete 3 Wellbeing quests this week" → +50 bonus XP

**Streak Challenges**
- "Maintain your streak for 7 days" → Unlock exclusive badge
- "Complete a quest every day this week" → +200 bonus XP

**Combo Challenges**
- "Complete 2 different branch quests in one day" → +75 bonus XP
- "Complete 3 quests in a row without breaks" → +50 bonus XP

### Display
- Weekly challenge card on the home screen (above quest preview)
- Progress bar per challenge
- Countdown timer: "Resets in 3d 14h"
- Completed challenges show with a checkmark and earned XP

### Data
Use existing `challenges` table. Auto-generate weekly challenges based on user's branch and level.

---

## 5. Daily Quest Streak Bonus

### Concept
Multiplier that grows with consecutive daily completions, not just logins.

### Mechanics

| Consecutive Days | Multiplier | Visual |
|-----------------|------------|--------|
| 1 day | 1.0x | Normal |
| 3 days | 1.25x | Bronze glow |
| 7 days | 1.5x | Silver glow |
| 14 days | 1.75x | Gold glow |
| 30 days | 2.0x | Diamond glow |

### Display
- Multiplier shown on each quest card: "+25 XP (1.5x 🔥)"
- Multiplier badge on the home screen
- Breaking the streak resets the multiplier

---

## 6. Focus Mode (Pomodoro Quests)

### Concept
Some quests are better done with focused time. Add a timer mode for quests.

### Flow
1. User starts a quest → "Start Focus Mode" option
2. Timer starts (5/15/30 min based on `duration_min`)
3. During focus mode: minimal UI, no distractions
4. Timer ends → auto-complete the quest
5. Bonus XP for completing in focus mode (+10%)

### Display
- Full-screen timer with countdown
- Background color changes based on branch
- Ambient sounds (optional): rain, lo-fi, white noise
- Post-focus reflection: "How focused were you? 😴😐🔥"

---

## 7. Profile Customization

### Concept
Let users personalize their identity. Gen Z cares about self-expression.

### Customizable Items

**Avatar**
- Choose from preset avatars (emoji-based or illustrated)
- Unlock new avatars by reaching milestones
- Animated avatar for premium/streak legends

**Title**
- Earned titles displayed under username:
  - "Newbie" → "Apprentice" → "Specialist" → "Master" → "Legend"
  - Branch-specific: "Career Climber", "Zen Master", etc.

**Theme**
- Unlock color themes by completing branch milestones
- Career theme (blue), Finance theme (green), etc.
- Seasonal themes (limited time)

**Profile Card**
- Customizable profile card with selected badges, title, and stats
- Shareable as an image (see Shareable Progress Cards)

---

## 8. Comparison & Competition

### Concept
Gen Z is competitive. Show them where they stand.

### Features

**Progress Comparison**
- "You're ahead of 78% of users in Career"
- "You completed more quests this week than 92% of users"
- Shown as a subtle badge or notification

**Weekly Leaderboard**
- Top 10 users by XP earned this week
- Shown on a dedicated leaderboard tab or bottom sheet
- Reset every Monday
- Top 3 get crown icons

**Branch Champions**
- Show the top user in each branch
- "Branch Champion" badge for the #1 in each branch
- Changes weekly

**Friend Challenges**
- "Challenge a friend to complete more quests this week"
- Both users see each other's progress
- Winner gets a badge

---

## 9. Quest Streak Chains

### Concept
Visual chain of completed quests that grows daily. Breaks the chain if you miss a day.

### Display
- Chain visualization on the home screen:
  ```
  🔗🔗🔗🔗🔗🔗🔗 (7 chain)
  ```
- Each link represents a day with at least 1 quest completed
- Breaking the chain shows a broken link animation
- Chain milestones: 7 = bronze chain, 30 = gold chain, 100 = diamond chain

### Difference from Streak
- Streak = consecutive days logged in
- Chain = consecutive days with at least 1 quest completed
- Chain is harder to maintain (requires actual activity, not just login)

---

## 10. Limited-Time Events

### Concept
Seasonal or themed events that create urgency and FOMO.

### Event Types

**Branch Blitz**
- "Career Week" — All career quests give 2x XP for 7 days
- "Wellbeing Weekend" — Wellbeing quests give 3x XP for 2 days

**Holiday Events**
- "New Year Resolution Challenge" — Complete 31 quests in January
- "Summer Sprint" — Complete 60 quests in June

**Community Events**
- "10,000 Quest Challenge" — All users contribute to a global quest count
- Progress shown as a global progress bar

### Rewards
- Exclusive badges only available during the event
- Limited-time avatar items
- Bonus XP multipliers

---

## 11. Notification Hooks

### Concept
Smart, personalized notifications that bring users back.

### Notification Types

**Streak At Risk**
- "Your 12-day streak ends in 2 hours! Do a quick quest to save it 🔥"

**Friend Activity**
- "Alex just hit Level 5! Can you catch up? 💪"

**Challenge Ending**
- "Weekly challenge resets tomorrow! You need 2 more quests 🎯"

**Streak Milestone**
- "You're 1 day away from a 30-day streak! Don't stop now 🔥🔥"

**Idle Reminder**
- "It's been 3 days... your skill tree misses you 🌳"

### Smart Timing
- Don't notify before 9am or after 10pm
- Don't notify more than 2x per day
- Learn from user behavior (when they usually complete quests)

---

## Priority v2

| Priority | Feature | Retention Impact | Virality Impact |
|----------|---------|-----------------|-----------------|
| P0 | Streak Showcase + Shame | ⬆️⬆️⬆️ | ⬆️ |
| P0 | Shareable Progress Cards | ⬆️ | ⬆️⬆️⬆️ |
| P1 | Achievement Badges | ⬆️⬆️ | ⬆️⬆️ |
| P1 | Weekly Challenges | ⬆️⬆️⬆️ | ⬆️ |
| P1 | Quest Streak Chains | ⬆️⬆️⬆️ | ⬆️ |
| P2 | Focus Mode | ⬆️⬆️ | — |
| P2 | Profile Customization | ⬆️⬆️ | ⬆️⬆️ |
| P2 | Comparison & Leaderboard | ⬆️⬆️ | ⬆️⬆️ |
| P3 | Limited-Time Events | ⬆️⬆️⬆️ | ⬆️⬆️⬆️ |
| P3 | Smart Notifications | ⬆️⬆️⬆️ | — |
