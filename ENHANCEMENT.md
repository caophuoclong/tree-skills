# Enhancement Backlog — Life Skill Tree

> Được tổng hợp sau khi review app tại `localhost:8081` ngày 17/03/2026.
> Phân loại theo mức độ ưu tiên: 🔴 High · 🟡 Medium · 🟢 Nice to Have

---

## 🐛 Bugs

| # | Màn hình | Mô tả | Ghi chú |
|---|---|---|---|
| B1 | Leaderboard | User card hiển thị tên "Minh Khoa" thay vì "Alex Kim" — data không map đúng với logged-in user | Xác nhận lại query user rank |
| B2 | Home (web) | Phần dưới màn hình trống sau banner "Suggested: Networking" — preview "Nhiệm vụ hôm nay" không render | Có thể do data fetching chưa kết nối |
| B3 | Home (mobile) | Text `Mental Energy100$` bị truncate — thiếu space và unit | Fix layout/spacing cho label |
| B4 | Quests (mobile) | Loading spinner quay vô tận, không hiển thị danh sách quest | Kiểm tra API call trên mobile |
| B5 | Quest Detail | Mục "Why This Matters" nội dung tiếng Anh trong khi toàn app dùng tiếng Việt | Dịch hoặc dùng cùng ngôn ngữ nhất quán |
| B6 | Home | Notification bell (🔔) click không có phản hồi — dead UI | Cần implement hoặc ẩn tạm |
| B7 | Home | FAB button (+) click không có phản hồi — dead UI | Cần define chức năng rõ ràng |

---

## 🔴 High Priority

### E1 — Quest Completion Animation
**Màn hình:** Quest Detail
**Mô tả:** Sau khi nhấn "Mark as Complete", hiện tại không có phản hồi visual nào. Cần thêm:
- XP float animation: `+10 XP` bay lên từ button
- Progress bar của branch cập nhật real-time
- Nếu hoàn thành hết daily quests (5/5): confetti + banner "Nhiệm vụ hôm nay hoàn thành! 🎉"
- Haptic feedback nhẹ (mobile)

**Why:** Đây là dopamine hit quan trọng nhất của gamification loop. Thiếu animation = mất đi cảm giác reward.

---

### E2 — FAB (+) Quick Menu
**Màn hình:** Global (bottom nav)
**Mô tả:** Nút FAB hiện không làm gì. Gợi ý implement Quick Menu với 3 options:
- ⚡ **Log hoạt động** — ghi nhanh 1 quest đã làm ngoài app
- 🎯 **Quest gợi ý** — shortcut đến suggested quest
- 😊 **Check-in tâm trạng** — mood check-in nếu chưa làm hôm nay

**Why:** FAB là prime real estate trên mobile. Bỏ trống là lãng phí vị trí UX tốt nhất.

---

### E3 — Skill Node Detail Bottom Sheet
**Màn hình:** Skill Tree
**Mô tả:** Hiện tại tap vào node không có phản hồi. Cần mở bottom sheet gồm:
- Tên kỹ năng + icon branch
- Mô tả ngắn (2-3 dòng)
- Danh sách quest liên quan (2-3 quest)
- XP cần để unlock (nếu đang locked)
- Nút **"Bắt đầu ngay"** → navigate đến quest detail

**Why:** User cần biết "kỹ năng này học gì" trước khi commit thời gian làm quest.

---

### E4 — Home Screen — Preview Today's Quests
**Màn hình:** Home
**Mô tả:** Phần dưới home đang trống lớn. Thêm mini quest list:
- Hiển thị 2-3 quest card nhỏ với checkbox
- Có thể quick-complete trực tiếp từ home
- Link "Xem tất cả →" dẫn đến Quests tab

**Why:** User không nên phải navigate sang tab khác chỉ để biết hôm nay cần làm gì.

---

## 🟡 Medium Priority

### E5 — Level Up Screen
**Màn hình:** Toàn màn hình (trigger sau quest complete)
**Mô tả:** Khi đạt đủ XP để lên level (VD: 1,500 XP → Level 5), hiện full-screen celebration:
- Animation "LEVEL UP" lớn
- Confetti + particle effects
- Hiện level mới + title mới (VD: "Người mới bắt đầu" → "Nhà thám hiểm")
- Nút "Tiếp tục" để dismiss

**Why:** Level up là milestone lớn, cần visual tương xứng để tạo cảm giác thành tựu.

---

### E6 — Challenge Card Enrichment
**Màn hình:** Quests → Active Challenges
**Mô tả:** Card "7 Days Hard Discipline" hiện chỉ có tên và số người tham gia. Cần bổ sung:
- Progress bar: Day X/7
- Countdown đến deadline
- XP reward khi hoàn thành
- Nút **Join** / **Leave** rõ ràng
- Mô tả ngắn về challenge

**Why:** User không có đủ thông tin để quyết định có tham gia không.

---

### E7 — Notification Center
**Màn hình:** Notification bell → new screen
**Mô tả:** Bell icon đã có trên Home nhưng không dẫn đến đâu. Cần implement:
- Danh sách notifications với timestamp
- Loại notification: streak reminder, quest mới unlock, milestone đạt được, weekly recap
- Mark as read / clear all

**Why:** In-app notifications tăng re-engagement mà không cần push.

---

### E8 — Streak Milestone Badges
**Màn hình:** Profile + trigger animation
**Mô tả:** Tại các mốc 7 / 14 / 21 / 30 ngày streak, hiện:
- Badge đặc biệt trong Profile (hiện "Best: 19 days" nhưng không có badge)
- One-time popup animation khi đạt mốc
- Có thể share milestone lên mạng xã hội

**Why:** Profile hiện có "Best: 19 days" nhưng không có gì đánh dấu thành tích đó — missed opportunity.

---

### E9 — Language Consistency
**Toàn app**
**Mô tả:** Một số nội dung đang mix tiếng Anh trong flow tiếng Việt:
- Quest Detail "Why This Matters" → dịch sang "Tại sao điều này quan trọng?"
- Quest Detail "How To Complete" → "Cách hoàn thành"
- Quest Detail "Resources" → "Tài nguyên tham khảo"
- Leaderboard "Top Performers" → "Bảng xếp hạng tuần"

**Why:** Inconsistency tạo cảm giác app chưa hoàn thiện, ảnh hưởng trust của user.

---

### E10 — Leaderboard — Hiển thị rank của user
**Màn hình:** Leaderboard
**Mô tả:** Hiện user card (Minh Khoa/Alex Kim) hiển thị ở đầu trang nhưng không rõ rank số mấy so với bảng Top Performers. Cần:
- Hiện rank số rõ ràng (VD: "Bạn đang xếp hạng #4")
- Hiện khoảng cách đến người trên (VD: "Còn 160 XP để vượt Marcus Lee")

**Why:** Competitive gap là một trong những động lực mạnh nhất để user grind thêm quest.

---

## 🟢 Nice to Have

### E11 — Share Progress Card
**Màn hình:** Profile / Quest completion
**Mô tả:** Sau khi hoàn thành tất cả daily quests hoặc đạt milestone, offer generate ảnh card để share lên Instagram/TikTok Stories. Card gồm: avatar, level, streak, nhánh mạnh nhất, tagline.

**Why:** Viral loop quan trọng cho Gen Z Việt. Organic growth không tốn chi phí.

---

### E12 — Weekly Recap
**Màn hình:** Home (Chủ nhật) + Push notification
**Mô tả:** Mỗi Chủ nhật, hiển thị card tóm tắt tuần:
- Số quest hoàn thành
- XP kiếm được tuần này
- Branch nào được focus nhất
- So sánh với tuần trước

**Why:** Weekly recap tăng D7 và D30 retention đáng kể — user có lý do để quay lại mỗi tuần.

---

### E13 — Mood Check-in → Quest Suggestion
**Màn hình:** Home
**Mô tả:** Mood check-in hiện tại chỉ record data, chưa có action. Sau khi chọn mood:
- Mood tốt → suggest Career/Finance quest
- Mood trung bình → suggest Soft Skills quest
- Mood xấu → suggest Wellbeing quest
- Thêm +5 XP bonus cho việc check-in hàng ngày

**Why:** Personalized suggestion tăng quest completion rate và tạo cảm giác app "hiểu mình".

---

### E14 — Quest History
**Màn hình:** Quests → tab mới "Đã hoàn thành"
**Mô tả:** Tab xem lại các quest đã làm, filter theo ngày/branch. Hữu ích để user nhìn lại tiến trình.

---

### E15 — All Time vs Weekly Leaderboard Differentiation
**Màn hình:** Leaderboard
**Mô tả:** Tab "All Time" hiện không khác biệt với "Weekly". Cần tách data riêng và có thể thêm Hall of Fame cho top 3 all-time.

---

## 📊 Summary

| Priority | Count |
|---|---|
| 🐛 Bugs | 7 |
| 🔴 High | 4 |
| 🟡 Medium | 6 |
| 🟢 Nice to Have | 5 |
| **Total** | **22** |

---

*Last updated: 17/03/2026 — reviewed by Claude via localhost:8081*
