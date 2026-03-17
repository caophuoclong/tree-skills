# Prompt Design — AI UI Generation
**Ứng dụng:** Cây Kỹ Năng Cuộc Sống (Life Skill Tree)
**Dùng cho:** Stitch (Google), v0 (Vercel), Figma AI, Galileo AI, hoặc bất kỳ AI design tool nào
**Cập nhật lần cuối:** 2026-03-17

---

## Cách dùng file này

Mỗi section dưới đây là một **prompt hoàn chỉnh** — copy-paste thẳng vào tool.
Các prompt được viết theo cấu trúc: **[App context] + [Screen] + [Visual style] + [Key elements]**.

> 💡 **Tips:** Nếu tool cho phép attach reference image, thêm screenshot của Duolingo (cho layout) và Linear app (cho dark mode) để guide visual direction.

---

## Base Context (thêm vào đầu mọi prompt)

```
App: A gamified personal development app for Vietnamese Gen Z.
Called "Life Skill Tree" — users grow 4 skill branches (Career, Finance, Soft Skills, Mental Well-being) by completing daily quests.
Core mechanic: RPG-style skill tree, XP system, daily streaks, and a "Stamina" mental health bar.
Style: Dark-first, calm, focused. Think Linear meets Duolingo.
```

---

## Prompt 1 — App Overview / Design Direction

```
Design a mobile app UI for a gamified self-development app called "Life Skill Tree" targeting Vietnamese Gen Z users (18–27).

Visual style:
- Dark mode first. Background: deep near-black (#0D0D0F)
- Glassmorphism cards: frosted glass effect with subtle white borders (rgba white, 8% opacity)
- Accent colors: purple/lavender (#7C6AF7) as primary brand, with 4 branch colors — blue for Career, green for Finance, yellow for Soft Skills, pink for Mental Well-being
- Typography: bold display font for headings, clean sans-serif for body
- Bento grid layout on home screen — asymmetric rectangular cards of different sizes
- Micro-interactions feel alive: subtle glows, spring animations, haptic-ready

Mood: calm productivity meets gaming. Not childish like Duolingo, not corporate like LinkedIn. Think "beautiful dark RPG dashboard".

Show: Home dashboard, Skill Tree screen, Quest card, and a Level Up moment.
```

---

## Prompt 2 — Home Dashboard (Bento Grid)

```
Design the Home Dashboard screen for a dark-mode gamified self-development mobile app.

Layout: Bento Grid — asymmetric cards on a dark background (#0D0D0F).

Cards to include:
1. Skill Tree Progress (large, 2/3 width) — shows 4 branches with circular progress rings: Career (blue), Finance (green), Soft Skills (yellow), Well-being (pink)
2. Daily Streak (small, 1/3 width) — fire emoji + "12 days" in bold, glow effect
3. Stamina Bar (small, 1/3 width) — horizontal bar labeled "Mental Energy", currently at 72%, green fill
4. Today's Quests (medium, 1/3 width) — "3 quests" with branch-color dots
5. XP Progress (large, 2/3 width) — "Level 4 → Level 5", filled progress bar, "1,240 / 1,500 XP"

Style:
- Cards use glassmorphism: rgba(255,255,255,0.05) background, rgba(255,255,255,0.08) border, 20px blur
- Rounded corners (16dp)
- No harsh shadows — use soft inner glow instead
- White text, secondary text in zinc-400 (#A1A1AA)
- Minimal icons, no clutter

Bottom navigation: Home, Skill Tree, Quests, Profile — icon only, active = lavender (#7C6AF7)
```

---

## Prompt 3 — Skill Tree Screen

```
Design a Skill Tree screen for a mobile RPG-inspired self-development app. Dark mode.

The skill tree has 4 branches arranged vertically or radially:
- Career/Tech (blue, #4DA8FF)
- Financial Literacy (green, #34D399)
- Soft Skills (yellow, #FBBF24)
- Mental Well-being (pink, #F472B6)

Each branch has nodes arranged in 3 tiers (Beginner → Intermediate → Advanced):
- Locked nodes: dim, gray, lock icon overlay
- In-progress nodes: glowing border in branch color, pulsing subtle animation
- Completed nodes: solid fill in branch color, checkmark icon

Visual:
- Dark background with subtle grid or particle texture
- Connecting lines between nodes (thin, branch-colored, dashed for locked paths)
- Current node has a bright glow radius
- Progress label at top: "Career: Level 2 / 5 nodes completed"

Add a floating "Today's Quest" button at the bottom anchored to the active node.
```

---

## Prompt 4 — Quest Card & Daily Quests Screen

```
Design a Daily Quests screen for a dark-mode productivity app with gamification.

Show a list of 3–4 quest cards. Each card:
- Glassmorphism style (frosted dark card)
- Left border accent (4dp thick) in branch color:
  Blue for Career quest, Green for Finance, Pink for Well-being
- Quest title in white, bold (e.g. "Research one job in your field — 15 min")
- Branch tag (small chip, branch color background)
- Duration tag ("15 min")
- XP reward badge top-right ("+25 XP" in brand purple)
- Circular checkbox on the right — empty = outline, completed = filled lavender + checkmark

One card should appear completed (filled checkbox, slightly faded opacity, strikethrough title).

At the top: "Today's Quests" header + "2/3 complete" progress indicator.
Stamina mini-bar visible at top as a subtle header element.
Background: #0D0D0F, cards float with glass effect.
```

---

## Prompt 5 — Onboarding Assessment Screen

```
Design a single-question onboarding assessment screen for a mobile app. Dark mode, calm, minimal.

The screen shows:
- Progress bar at top (step 3 of 10), thin, lavender fill (#7C6AF7)
- Question in large display font: "What's your biggest goal right now?"
- 4 answer options as large tap-friendly cards:
  A. "Build my career skills"
  B. "Get my finances in order"
  C. "Improve how I communicate"
  D. "Feel more mentally balanced"

Option cards: rounded rectangles, glass style, full width. Selected state: lavender border + subtle background tint.
- No selected state shown (unselected state)
- "Back" text button top-left, no "Next" button (auto-advance on select)

Mood: like a calm personality quiz, not a stressful test. Generous white space.
Typography: large, readable, confident.
```

---

## Prompt 6 — Level Up Moment (Celebration Screen)

```
Design a full-screen Level Up celebration moment for a dark-mode gamified app.

Elements:
- Deep dark background with radial particle burst effect (lavender/purple particles)
- Large bold text center: "LEVEL UP!" in display font, glowing
- Sub-text: "You've reached Level 5"
- Animated skill tree icon or character silhouette (leveled up form)
- Unlock reveal: "🔓 New unlock: Finance Branch — Advanced Tier"
- XP summary: "You earned 1,200 XP this week"
- CTA button: "Continue" — solid lavender, full width, bottom

The feeling should be: earned triumph, not overloaded. Like a premium game moment — brief, impactful, beautiful.
Colors: Deep black bg, lavender primary glow, hints of gold (#FBBF24) for the level badge.
```

---

## Prompt 7 — Wellbeing / Mental Energy Screen

```
Design a Mental Well-being module screen for a wellness + productivity app. Dark mode, very calm and safe-feeling.

Screen name: "Mental Energy" (not "Mental Health" — softer framing)

Elements:
- Soft pink/rose accent color (#F472B6) for this entire screen
- Large Stamina bar at top: "Your Mental Energy — 45%" in warning yellow state
  Bar shows yellow fill, subtitle: "You've been grinding — take a break"
- 3 "Recovery Quests" below:
  Card 1: "5-min guided breathing" — ☁️ icon
  Card 2: "Write 3 things you're grateful for" — 📝 icon
  Card 3: "Listen: 5-min calming podcast" — 🎧 icon
  Each card: glass style, pink left border
- Motivational text at bottom: "Taking care of yourself IS progress."
- Optional: subtle animated background — very slow floating orbs or gentle gradient shift

Mood: a spa, not a hospital. Warm, non-judgmental, inviting.
No clinical language. No alerts or red warnings — just a gentle nudge.
```

---

## Prompt 8 — Profile Screen

```
Design a user Profile screen for a dark-mode gamified self-development app.

Layout sections from top to bottom:
1. Avatar (circular, 80dp) + display name + "Level 4 · 1,240 XP"
2. Streak display: 🔥 "12-day streak" in large text with flame animation hint
3. Stats grid (2x2 Bento):
   - Total quests completed: 47
   - Days active: 23
   - Best streak: 18 days
   - Skill branches active: 3/4
4. Skill branch progress bars (4 bars, each in branch color):
   Career ████████░░ 80%
   Finance ██████░░░░ 60%
   Soft Skills ████░░░░░░ 40%
   Well-being ███░░░░░░░ 30%
5. Premium badge (if subscribed): subtle lavender glow card — "Premium · Active"
6. Settings link at bottom

Style: clean, achievement-focused. Like a gaming profile meets a clean dashboard.
Dark mode. Glass cards for stats section.
```

---

## Component Prompts (for individual component generation)

### Button — Primary
```
Design a primary CTA button for a dark-mode mobile app.
Background: solid lavender (#7C6AF7). Text: white, semibold, 16sp.
Shape: rounded pill (100dp radius). Height: 56dp. Full width.
Pressed state: slightly darker (#6A59E0) + subtle scale down (0.97).
No shadow. Clean, minimal, confident.
```

### Empty State
```
Design an empty state illustration for a mobile app's Quest screen.
Message: "No quests for today — check back tomorrow!"
Illustration style: minimal line art, dark theme, lavender accent.
Mascot: optional small character (a tiny sprout/plant growing — symbolizing skill tree).
CTA: "Explore Skill Tree" button below.
```

### Mood Check-in Widget
```
Design a compact daily mood check-in widget for a mobile app.
Shows 5 emoji options in a horizontal row: 😔 😕 😐 🙂 😊
Label above: "How are you feeling today?"
Selected state: emoji scale up (1.3x) + circle background in soft color.
Card style: glass, rounded, subtle pink border.
Compact height — designed to fit inside a larger dashboard card.
```

---

*Tài liệu này dùng kèm [[DESIGN_SYSTEM]] để giữ consistency khi generate*
*Reference: [[MVP_FEATURE_SCOPE]] cho feature context*
