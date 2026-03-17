# Engagement & Visual Redesign — Life Skill Tree

> Mục tiêu: Biến app từ "useful but boring" → "can't stop opening it"
> Ngày tạo: 17/03/2026

---

## 🎯 Vấn đề cốt lõi

App hiện tại có 2 điểm yếu chính:

1. **Visual quá flat** — Dark theme đúng hướng nhưng thiếu depth. Cards không có glow, không có glassmorphism thật sự, màu brand (#7C6AF7) chỉ xuất hiện ở vài điểm nhỏ. Skill Tree trông như checklist dọc hơn là cây kỹ năng.

2. **Core loop quá ngắn** — Mở app → tick quest → đóng app. Không có lý do để ở lại lâu hơn hoặc quay lại nhiều lần trong ngày.

---

## 🎨 Visual Redesign

### V1 — Skill Tree "Glow Up"
**Priority: 🔴 High**

Skill Tree là trái tim của app nhưng đang trông như một list có icon tròn. Cần redesign:

- **Connecting lines** — Các node nối với nhau bằng đường cong có glow effect theo màu branch. Khi node được unlock, đường nối sáng lên với animation chạy dọc từ node cha → con.
- **Node states rõ ràng hơn:**
  - Completed: glow sáng + checkmark + particle nhỏ lởn vởn
  - In Progress: pulse animation nhẹ, border gradient
  - Locked: blur + icon khóa mờ, không có glow
  - Available to unlock: shimmer effect, gợi ý "Sẵn sàng mở khóa"
- **Background tree silhouette** — Layer phía sau là hình cái cây mờ, tạo context visual cho skill tree

**Reference:** Genshin Impact talent tree, Path of Exile passive tree (simplified)

---

### V2 — Glassmorphism Cards
**Priority: 🔴 High**

Tất cả cards hiện tại là flat dark. Cần thêm:

- **Background blur** trên cards (`backdrop-filter: blur(12px)`)
- **Border gradient** mỏng 1px theo màu branch tương ứng
- **Subtle inner glow** ở góc trên trái
- **Quest cards** có left border màu branch (Career = xanh, Finance = xanh lá, v.v.)
- **Home bento cards** có gradient background nhẹ thay vì solid dark

```
Before: background: #1A1A2E, border: none
After:  background: rgba(255,255,255,0.05),
        backdrop-filter: blur(12px),
        border: 1px solid rgba(124,106,247,0.2),
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.05)
```

---

### V3 — Màu sắc Branch rõ hơn
**Priority: 🔴 High**

4 màu branch đang chỉ dùng ở dots nhỏ và progress rings. Cần push mạnh hơn:

- Quest cards → left accent bar màu branch (4px wide, full height)
- Skill Tree tab active → glow dưới tab theo màu branch đó
- Profile branch bars → thêm label icon + màu rõ hơn
- Home skill rings → thêm glow ngoài ring khi > 50%

| Branch | Màu | Glow |
|---|---|---|
| Career | #4DA8FF | Electric blue |
| Finance | #34D399 | Emerald |
| Soft Skills | #FBBF24 | Amber |
| Well-being | #F472B6 | Pink |

---

### V4 — Animated Progress Bars & XP
**Priority: 🟡 Medium**

- XP bar trên Home: shimmer animation chạy liên tục từ trái sang phải
- Khi XP tăng (sau complete quest): bar fill animation mượt 0.8s ease-out
- Skill rings trên Home: có thể tap để xem breakdown, rotation animation khi load
- Mental Energy bar: màu thay đổi theo level (xanh lá → vàng → đỏ khi < 30%)

---

### V5 — Ambient Background
**Priority: 🟡 Medium**

Thêm subtle background texture để tránh cảm giác "void đen":

- Noise texture nhẹ (3-5% opacity) trên toàn app
- Radial gradient mờ ở góc màn hình theo màu branch đang active
- Hoặc particle system rất nhẹ (5-10 particles nhỏ di chuyển chậm)

---

### V6 — Typography Hierarchy
**Priority: 🟡 Medium**

Hiện tại mọi text có cùng weight, không có visual hierarchy rõ:

- Level/XP numbers → dùng **Clash Display** bold, size lớn hơn
- Quest titles → Inter SemiBold
- Labels/metadata → Inter Regular, opacity 60%
- XP badges (`+10 XP`) → màu vàng/amber rõ hơn, pill shape rõ hơn

---

## 🎮 Engagement Features

### G1 — Daily Login Bonus
**Priority: 🔴 High**

Popup nhỏ xuất hiện lần đầu mở app mỗi ngày:
- Ngày 1-6: +5 XP / +10 XP / +15 XP tăng dần
- Ngày 7 (streak day): bonus đặc biệt +50 XP + badge "Tuần đầu tiên"
- Animation: chest mở ra, XP coins bay vào counter

**Implementation:** Check `last_login_date` vs today khi app mount. Cực kỳ đơn giản nhưng tạo habit mạnh.

---

### G2 — Combo Multiplier
**Priority: 🔴 High**

Hoàn thành quests liên tiếp trong ngày nhân hệ số XP:

| Quest thứ | Multiplier |
|---|---|
| 1-2 | x1.0 (bình thường) |
| 3 | x1.5 🔥 |
| 4 | x1.75 🔥🔥 |
| 5+ | x2.0 🔥🔥🔥 |

- Hiển thị combo counter nổi bật khi đang active
- Sound effect nhỏ (optional, có thể tắt) khi combo tăng
- Sau khi complete quest → show `+25 XP x1.5 = +37 XP`

**Why:** Khuyến khích user hoàn thành nhiều quests trong 1 session, không quit sau quest đầu tiên.

---

### G3 — Achievement Badge System
**Priority: 🔴 High**

Hệ thống huy hiệu collect được, hiển thị trong Profile:

**Career badges:**
- 🎯 "Đầu tiên" — hoàn thành quest Career đầu tiên
- 💼 "Chuyên nghiệp" — 10 Career quests
- 🚀 "Rocket" — unlock hết Tier 3 Career

**Streak badges:**
- 🔥 "Bắt đầu" — 3 ngày streak
- ⚡ "Điện" — 7 ngày streak
- 💎 "Kim cương" — 30 ngày streak

**Special badges:**
- 🌟 "All-rounder" — có progress > 50% ở cả 4 branches
- 🏆 "Top 10" — vào top 10 leaderboard tuần
- 🌙 "Cú đêm" — hoàn thành quest sau 10PM

**UI:** Grid 4 columns trong Profile, earned badges sáng, locked badges mờ + tên ẩn (tạo curiosity)

---

### G4 — Avatar Customization
**Priority: 🟡 Medium**

Dùng XP để unlock frame/border cho avatar:

| Item | Cost | Unlock condition |
|---|---|---|
| Frame tím gradient | Free | Default |
| Frame Career (xanh) | 100 XP | Hoặc unlock Tier 1 Career |
| Frame Finance (xanh lá) | 100 XP | Hoặc unlock Tier 1 Finance |
| Frame "On Fire" (cam) | 500 XP | 7-day streak |
| Frame "Diamond" (holographic) | 2000 XP | Level 10 |
| Frame "Legend" (gold) | — | Top 1 leaderboard tuần |

**Why:** Tạo sense of ownership + visible status symbol trong Leaderboard.

---

### G5 — Mascot Luna Integration
**Priority: 🟡 Medium**

Đưa mascot Luna vào các điểm quan trọng của app:

- **Home** — Luna nhỏ góc dưới, idle animation nhẹ
- **Quest complete** — Luna nhảy + thumbs up
- **Streak milestone** — Luna cầm banner
- **Stamina thấp** — Luna ngáp, nhắc nghỉ ngơi
- **Level up** — Luna spin + confetti

**States cần thiết:** `idle`, `celebrate`, `sleepy`, `cheer`, `levelup`

---

### G6 — "Streak Freeze" Mechanic
**Priority: 🟡 Medium**

Freemium feature quan trọng:

- **Free:** 1 streak freeze/tháng (dùng để không mất streak khi bận)
- **Premium:** Unlimited streak freeze
- Hiển thị số freeze còn lại rõ ràng trong Profile
- Trigger popup khi user bỏ lỡ 1 ngày: "Dùng Streak Freeze để bảo vệ streak 12 ngày của bạn?"

**Why:** Tạo anxiety khi gần mất streak + upsell Premium tự nhiên.

---

### G7 — "Power Hour" Daily Event
**Priority: 🟡 Medium**

Mỗi ngày có 1 khung giờ Power Hour (random, push notification trước 15 phút):
- Trong Power Hour: tất cả XP x2
- Kéo dài 1 tiếng
- Hiển thị countdown timer nổi bật trên Home khi đang active

**Why:** Tạo urgency + FOMO, khuyến khích mở app vào giờ cụ thể. Tăng DAU mạnh.

---

### G8 — Skill Node "Mastery" System
**Priority: 🟢 Nice to Have**

Sau khi unlock 1 node, có thể "master" nó bằng cách làm lại quests liên quan:
- Mastery level 1-3 (thể hiện bằng số sao)
- Mỗi lần mastery: +XP bonus nhỏ, node glow mạnh hơn
- Mastered nodes hiển thị khác biệt trong Skill Tree

**Why:** Tăng replayability, user có lý do làm lại quest cũ.

---

### G9 — Social Proof & FOMO
**Priority: 🟢 Nice to Have**

Thêm social signals nhỏ vào UI:
- Quest card: "🔥 234 người đã làm quest này hôm nay"
- Challenge: "Minh vừa join 7 Days Hard Discipline"
- Leaderboard: highlight khi ai đó vượt qua mình

---

### G10 — Sound Design (Optional Toggle)
**Priority: 🟢 Nice to Have**

Âm thanh nhẹ, có thể tắt hoàn toàn:
- Quest complete: tiếng coin nhẹ
- Level up: short jingle
- Streak milestone: tiếng trống nhỏ
- XP float: whoosh nhẹ

---

## 📐 Implementation Order

Nếu chỉ có 1-3 dev, thứ tự nên làm:

```
Sprint 1 (Visual Impact, ~1 tuần):
  V1 — Skill Tree Glow Up
  V2 — Glassmorphism Cards
  V3 — Branch Colors

Sprint 2 (Engagement Core, ~1 tuần):
  G1 — Daily Login Bonus
  G2 — Combo Multiplier
  G3 — Achievement Badges (v1: chỉ 5-6 badges)

Sprint 3 (Retention, ~1 tuần):
  G5 — Luna Mascot (basic states)
  G6 — Streak Freeze
  V4 — Animated XP/Progress

Sprint 4+ (Growth):
  G4 — Avatar Customization
  G7 — Power Hour
  E11 — Share Progress Card
```

---

## 📊 Summary

| Category | Count |
|---|---|
| 🎨 Visual Redesign | 6 items |
| 🎮 Engagement Features | 10 items |
| **Total mới** | **16 items** |

---

*Last updated: 17/03/2026*
*Xem thêm bug fixes & UX enhancements: [[ENHANCEMENT]]*
