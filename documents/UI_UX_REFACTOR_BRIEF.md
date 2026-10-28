# UI/UX Refactor Brief — Life Skill Tree

Chỉ gồm **feature** và **hướng design UI/UX** để làm lại giao diện. Không bàn backend, kiến trúc hay đánh giá product.

**App là gì (1 dòng):** app gamified cho Gen Z Việt Nam: làm quest nhỏ hằng ngày → nhận XP → mở khóa node trên Cây Kỹ Năng 4 nhánh (Career · Finance · Soft Skills · Wellbeing) → giữ Stamina để không burnout.

**Core loop (mọi quyết định UX phải phục vụ vòng này):**
`Mở app → thấy việc cần làm hôm nay → hoàn thành quest → thấy phần thưởng + tiến trình → có lý do quay lại ngày mai`

> Các quyết định ở mục 1 là **mặc định mình chọn** vì chưa có trả lời từ bạn. Đổi được, nhưng đổi thì các mục sau phải xem lại.

---

## 1. Quyết định nền tảng

| # | Quyết định | Chọn |
|---|---|---|
| 1 | Hướng visual | **Calm base, punchy rewards**: nền dark glass nhẹ + glow theo màu nhánh; khoảnh khắc thưởng và CTA chính dùng viền đậm + hard shadow. Thay Neobrutalism toàn app (quá ồn khi người dùng đang stress). |
| 2 | Theme | Dark là mặc định, có light. Vẽ cả hai. |
| 3 | Màu Career | `#4DA8FF` (không trùng brand tím `#7C6AF7`) |
| 4 | Streak | **Forgive, don't punish**: có grace day + comeback bonus, không hiển thị "mất streak" như thất bại |
| 5 | Leaderboard | Ẩn khỏi bản đầu. Nếu giữ thì chỉ nhóm bạn bè, không public |
| 6 | Power Hour / social proof | Không làm (tạo FOMO, ngược "Calm") |
| 7 | Ngôn ngữ | Toàn bộ tiếng Việt, không lẫn Anh |
| 8 | Icon | Một bộ line icon cho UI; emoji chỉ dùng trong nội dung (quest, mood) |

### 1.1 Nguyên tắc UX

1. **Calm by default** — không gây lo âu, nhất là Wellbeing.
2. **Progress is visible** — luôn thấy mình tiến, dù chỉ 1%.
3. **Reward the act, not the result** — khen hành động, không so sánh người khác.
4. **Forgive, don't punish** — bỏ lỡ ngày là chuyện bình thường, app giúp quay lại.
5. **Keep users inside** — vòng lặp nào cũng hoàn tất trong app.
6. **Một việc tiếp theo rõ ràng** — mỗi màn chỉ có 1 CTA chính.
7. **Không có màn trống chết** — luôn có empty state có hướng dẫn hành động.

---

## 2. Feature (đã gộp, xếp ưu tiên)

Cột **Hiện trạng**: *Có* = đã có UI/logic, cần vẽ lại; *Một phần* = có nhưng thiếu; *Mới* = chưa có.

### Nhóm A — Core loop phải mượt (làm trước)

| # | Feature | Hiện trạng | Yêu cầu UX |
|---|---|---|---|
| A1 | **Hoàn thành quest** | Có | Nút: idle → pressed → done (✓ xanh). XP bay lên `+25 XP`, ring nhánh và XP bar cập nhật, haptic nhẹ. Xong hết quest ngày → confetti + banner. |
| A2 | **Skill Node sheet** | Có | Bottom sheet: tên, tier, mô tả 2–3 dòng, quest liên quan, XP cần để mở, CTA "Bắt đầu ngay". 4 state: khóa / sẵn sàng mở / đang học / hoàn thành. |
| A3 | **Home không có vùng trống** | Một phần | Preview 2–3 quest có checkbox, hoàn thành ngay trên Home, link "Xem tất cả". Có trạng thái 0 quest. |
| A4 | **FAB menu** | Mới (nút đang bấm không làm gì) | 3 hành động: Log hoạt động · Quest gợi ý · Check-in tâm trạng. Mở bằng spring, tap nền để đóng. Không có hành vi thì bỏ nút. |
| A5 | **Level-up** | Có | Toàn màn hình: số level, tên level mới, confetti ≥ 1.5s, CTA "Tiếp tục". |
| A6 | **Empty / loading / error / offline** | Thiếu | Một bộ state dùng chung cho mọi danh sách; không spinner vô tận, không trang trắng. |
| A7 | **Notification center** | Một phần | Danh sách theo loại, chấm chưa đọc, "đánh dấu đã đọc", empty "Bạn đã xem hết 🎉". |

### Nhóm B — Giữ chân

| # | Feature | Hiện trạng | Yêu cầu UX |
|---|---|---|---|
| B1 | **Quick Quest 5 phút** | Có | Banner trên Home khi chưa làm quest nào: "Chỉ mất 5 phút ⚡". Một quest, một nút hoàn thành, xong có "làm thêm 1 cái?". |
| B2 | **Mood check-in → gợi ý** | Có (chỉ ghi) | 5 emoji, đóng được trong 1 tap. Mood thấp → quest nhẹ/Wellbeing lên đầu + lời ấm "Hôm nay chỉ cần 1 nhiệm vụ thôi 💙". Mood cao → quest khó lên đầu. +5 XP. |
| B3 | **Streak + recovery** | Một phần | Lửa animate khi tăng; khi sắp mất: viền đỏ nhẹ (không báo động). Bỏ 1 ngày: "Streak ngủ quên hôm qua 😅 — làm 2 quest để cứu". Quay lại sau khi mất: +50 XP "Comeback". Banner khi còn 1–3 ngày tới mốc 7/14/30. |
| B4 | **Daily brief** | Có | Card 1 lần/ngày: "3 điều quan trọng hôm nay". Dismiss được, tự ẩn sau quest đầu tiên. |
| B5 | **Weekly review** | Có | Modal thứ Hai + vào từ Profile. Số quest, XP, nhánh tiến bộ nhất, so với tuần trước (+%). Giọng tích cực. |
| B6 | **Habit heatmap** | Có | Lưới 4–12 tuần, tap ngày xem số quest + XP theo nhánh. Nằm ở Profile. |
| B7 | **Combo** | Có | Thanh combo hiện khi ≥ 3 quest liên tiếp, nhấp nháy khi tăng bậc; sau hoàn thành: `+25 XP ×1.5 = +37`. |
| B8 | **Login bonus** | Có | Modal đầu ngày, tự tắt sau 4s hoặc tap. Ngày 7 có phần thưởng riêng. |
| B9 | **Contextual ordering** | Mới | Sắp xếp lại (không ẩn) quest theo giờ/cuối tuần/streak sắp mất; nhãn "✦ Gợi ý hôm nay"; nhánh bị bỏ >3 ngày có nhãn "Cần chú ý". |
| B10 | **Bookmark "Để sau"** | Mới | Mục thu gọn dưới danh sách quest, "Để sau (3)". |
| B11 | **Banner Wellbeing** | Có | Khi làm ≥ 3 quest không phải Wellbeing mà 0 Wellbeing: banner dismiss được "Nghỉ 5 phút nhé 🧘". Node Wellbeing trên cây pulse nhẹ. |
| B12 | **Offline** | Mới | Quest vẫn tick được; chip nhỏ "☁️ Đồng bộ đang chờ". Không modal lỗi. |

### Nhóm C — Thương hiệu, tăng trưởng, doanh thu

| # | Feature | Hiện trạng | Yêu cầu UX |
|---|---|---|---|
| C1 | **Skill Tree dạng cây thật** | Một phần | Xem mục 4.1. Đây là màn quan trọng nhất. |
| C2 | **Badges** | Chỉ UI | Lưới 4 cột; locked mờ + ẩn tên để tò mò; popup khi mở khóa; chọn 3 badge ghim ở Profile. |
| C3 | **Share card** | Mới | Ảnh 9:16 cho Stories: avatar, level, streak, nhánh mạnh nhất. 3 template. Gợi ý sau khi xong hết quest ngày hoặc đạt mốc. |
| C4 | **Paywall / Premium** | Mới | So sánh Free và Premium (4 nhánh vs 2, 5 quest vs 3, shield, analytics 30 ngày), 99k/tháng. Xuất hiện khi mở nhánh bị khóa, hết shield, xem analytics dài. Không chặn core loop. |
| C5 | **Mascot Luna** | Mới | 5 state: idle, celebrate, sleepy, cheer, levelup. Dùng ở empty state, quest xong, stamina thấp, level-up. |
| C6 | **Avatar frame** | Một phần | Frame theo level/streak (tím mặc định, Career, Finance, On Fire, Diamond). |
| C7 | **Skill Builder (cây riêng AI)** | Có | Lối vào từ tab Cây (pill "Mặc định | Tùy chỉnh") và nút "+" . Luồng 3 bước: nhập mục tiêu → loading AI → chỉnh sửa. |
| C8 | **Focus Week** | Mới | Chọn 1 nhánh cho 7 ngày: quest nhánh đó lên đầu, +20% XP, ring nổi bật, tóm tắt cuối tuần. |
| C9 | **Quest chain** | Mới | "Phần 1/3 — Xây dựng thương hiệu cá nhân"; xong thì animation mở quest tiếp theo. |
| C10 | **Mastery node** | Mới | 1–3 sao cho node đã hoàn thành. Để sau. |

---

## 3. Design tokens

### 3.1 Màu (dark mặc định)

| Token | Giá trị | Dùng cho |
|---|---|---|
| bg-base | `#0D0D0F` (đêm) / `#121214` (ngày) | Nền (code hiện để `#2b2b2e`, cần sửa) |
| bg-surface | `#161618` | Card, sheet |
| bg-elevated | `#1E1E22` | Modal, overlay |
| brand-primary | `#7C6AF7` | CTA, tab active, level |
| brand-glow | `#A89BFA` | Highlight, glow |
| career | `#4DA8FF` | Sự nghiệp |
| finance | `#34D399` | Tài chính |
| softskills | `#FBBF24` | Kỹ năng mềm |
| wellbeing | `#F472B6` | Sức khỏe |
| success / warning / danger | `#34D399` / `#FBBF24` / `#F87171` | Trạng thái. Stamina: ≥70 / 30–69 / <30 |
| text-primary / secondary / muted | `#F4F4F5` / `#A1A1AA` / `#52525B` | Muted chỉ cho phụ, kiểm tương phản |
| glass | nền `rgba(255,255,255,.05–.08)`, viền `rgba(255,255,255,.08–.12)`, blur 12–20 | Card |

**Light:** `bgBase #F8F9FA`, surface `#FFFFFF`, text `#111827`, branch đậm hơn một bậc (`#3B82F6 / #10B981 / #F59E0B / #EC4899`). Thiết kế đủ cả hai theme.

### 3.2 Chữ
**Space Grotesk** (hiển thị + thân bài) và **Space Mono** (số: XP, level, streak, combo).
Thang: display-xl 32/38 · display-lg 24/30 · title 20/26 · body-lg 16/24 · body 14/21 · caption 12/16 · micro 10/14 (in hoa, cách chữ 1.2).
Kiểm tra dấu tiếng Việt ở mọi cỡ, nhất là micro in hoa.
Phân cấp: số level/XP lớn và đậm; tên quest SemiBold; metadata Regular, độ mờ ~60%; badge `+10 XP` màu amber, dạng pill rõ.

### 3.3 Khoảng cách, bo góc, độ sâu
- Base 4dp: 4 / 8 / 16 / 24 / 32 / 48 / 64. Lề màn 20, gap card 12, gap section 24.
- Radius 8 / 12 / 16 / 24 / full.
- Card glass: nền mờ + viền 1px (gradient nhẹ theo màu nhánh) + ánh sáng trong góc trên trái. Card quest có thanh trái 4dp màu nhánh.
- Hard shadow (4,4) chỉ cho CTA chính và khoảnh khắc thưởng.
- Nền: noise 3–5% + radial gradient mờ theo nhánh đang xem, để tránh "hố đen".

### 3.4 Motion & haptic

| Sự kiện | Hiệu ứng | Thời lượng | Haptic |
|---|---|---|---|
| Hoàn thành quest | checkbox 1→1.3→1, fill màu | 300ms spring | Light |
| Nhận XP | số count-up + bar fill, bar có shimmer chạy liên tục | 600ms ease-out | — |
| Level-up | burst toàn màn + modal scale | 800ms | Success |
| Mở khóa node | glow pulse + đường nối sáng chạy từ node cha | 500ms | Medium |
| Stamina thấp | thanh rung + đổi màu | 400ms | Warning |
| Streak mốc | 🔥 nảy | 350ms | Medium |

Spring: bounce `{300,20}`, smooth `{200,30}`. Easing: `cubic-bezier(.33,1,.68,1)`. Mọi animation phải có phương án **Reduce Motion**. Âm thanh tùy chọn, mặc định tắt.

---

## 4. Thiết kế từng màn

Mỗi màn vẽ đủ: **default · loading · empty · error · offline**, dark và light.

### 4.1 Skill Tree (ưu tiên số 1)
Hiện là list vòng tròn rời, node chỉ có dấu `?`, vùng giữa trống, pill nhánh bị cắt. Cần thành **cây**:
- Đường nối cong có glow theo màu nhánh; khi mở khóa, ánh sáng chạy từ cha xuống con.
- 5 trạng thái node: **Khóa** (mờ, icon khóa) · **Sẵn sàng mở** (shimmer, "Đủ XP") · **Đang học** (viền gradient + pulse) · **Hoàn thành** (fill + ✓ + hạt sáng) · **Mastered** (sao, sau).
- Silhouette cây mờ phía sau; ambient theo nhánh.
- Tab nhánh cuộn ngang không bị cắt; tab active có glow đúng màu nhánh.
- Thẻ "Nhánh hiện tại": tên, tier, `x/6 node`, thanh tiến độ.
- Pill "Mặc định | Tùy chỉnh" cho cây AI.
- Tap node → sheet A2. Tap node khóa → "Cần X XP để mở".
- Tham khảo: Genshin talent tree, Path of Exile passive tree (bản giản lược).

### 4.2 Home (bento)
Thứ tự từ trên xuống, mỗi thứ là một card độc lập:
1. Header: avatar + level + tên, chuông (có chấm chưa đọc), cài đặt.
2. Daily brief / Quick Quest banner (một trong hai, không cả hai).
3. 4 ring nhánh (glow khi > 50%, tap xem chi tiết) + streak + Stamina (đổi màu theo ngưỡng).
4. Quest hôm nay (2–3 item, tick ngay được).
5. XP/level bar (shimmer).
6. Gợi ý quest tiếp theo.
Quy tắc: không có vùng trống; Stamina < 30% thì card đó chuyển cảnh báo nhẹ + gợi ý Wellbeing.

### 4.3 Quests
Header: tiến độ ngày (`2/4`), combo, Stamina. Danh sách có thanh trái màu nhánh, badge XP/thời lượng. Dưới: "Để sau", "Thử thách đang diễn ra" (tiến độ `Ngày 3/7`, đếm ngược, XP thưởng, Tham gia/Rời). Khi Stamina = 0%: chỉ hiện Wellbeing quest + giải thích ngắn.

### 4.4 Quest detail
Tiêu đề, nhánh, thời lượng, XP; "Vì sao quan trọng", "Cách hoàn thành" (các bước), "Tài nguyên"; nếu thuộc chain thì "Phần 1/3". Một nút hoàn thành lớn cố định phía dưới (A1). Đã xong: nút thành "Hoàn thành ✓", vô hiệu.

### 4.5 Profile
Avatar + frame + level; thẻ Premium (dữ liệu thật); streak + best; 4 stat (quest, ngày hoạt động, best streak, nhánh active); tiến độ 4 nhánh (icon + màu rõ); badges ghim; heatmap; biểu đồ tuần (cột theo ngày, ngày không hoạt động là vạch phẳng, không để trống); lối vào weekly review, roadmap, cài đặt.

### 4.6 Onboarding
Splash → Welcome → Auth → Assessment (10 câu, 1 câu/màn, "Câu 3/10", quay lại được, "Bỏ qua" ở câu 1) → Đang tạo cây (2–3s, có trạng thái chậm/lỗi) → Reveal (hạt giống nở thành cây, dùng đúng ngôn ngữ visual của 4.1) → Home. Không có đáp án đúng/sai; nói rõ ở câu đầu.

### 4.7 Màn khác

| Màn | Ghi chú UX |
|---|---|
| Auth | Email, Google, Apple (Apple bắt buộc trên iOS khi có Google). Lỗi form hiện ngay dưới ô. |
| Branch detail | Danh sách node theo tier, tiến độ nhánh. |
| Notifications | Xem A7. |
| Roadmap | Mục tiêu ngắn/trung/dài hạn, thêm/tick/xóa. |
| Wellbeing | Giọng ấm; self-care; hotline; banner nhẹ khi mood "rất tệ" 3 ngày liên tiếp (không chặn luồng); disclaimer: *"Ứng dụng này không thay thế tư vấn tâm lý chuyên nghiệp."* |
| Settings | Theme, thông báo từng loại (tối đa 1/ngày, 8h–21h), ngôn ngữ, tài khoản. |
| Skill Builder | 3 bước (C7). |
| Paywall | C4. |
| Overlay | Level-up, login bonus, streak mốc, weekly review, streak recovery, share card, FAB menu, badge mới. Dùng chung một khung modal. |

---

## 5. Component cần dựng

Dựng thư viện trước, rồi lắp màn. Mỗi component có đủ state.

| Component | State cần vẽ | Code hiện có |
|---|---|---|
| Button | primary / secondary / ghost / danger × idle / pressed / disabled / loading | `atoms/Button` |
| Card | glass / solid / accent-left-bar / pressable | `atoms/NeoBrutalBox`, `GlassView`, `molecules/BentoCard` |
| SkillNode | 5 trạng thái | `atoms/NodeCircle`, `molecules/SkillNode` |
| QuestCard | todo / done / bookmarked / recommended / chain | `molecules/QuestCard`, `QuestItemComponent` |
| ProgressRing / XPBar | 0 / 50 / 100% / animating | `ProgressRing`, `XPProgressBar`, `XPShimmerBar` |
| StaminaBar | ≥70 / 30–69 / <30 / 0 | `StaminaBar` |
| StreakBadge | thường / có shield / sắp mất / mốc | `StreakBadge`, `StreakShieldBadge`, `StreakChainBar` |
| ComboBar | ẩn / ×1.5 / ×1.75 / ×2 | `ComboBar` |
| Pill / Badge / Tag | XP, tier, thời lượng, "Gợi ý hôm nay", "Cần chú ý" | `atoms/Badge` |
| BottomSheet, Modal, Toast | mở / đóng / kéo xuống | `NodeDetailModal`, `LevelUpModal`, `StreakToast` |
| Tab nhánh | chọn / không chọn / glow theo nhánh | `BranchFilterPill` |
| Avatar + Frame | 6 frame | `atoms/Avatar` |
| EmptyState | kèm Luna, kèm CTA | chưa có |
| Skeleton | list / card / ring | chưa có |
| Checkbox | trống / đang tick (spring) / đã tick | `atoms/Checkbox` |

---

## 6. Nội dung & giọng văn

- Tiếng Việt, thân thiện, không phán xét, xưng "bạn".
- Mất streak: "Streak ngủ quên hôm qua 😅". Ngày mệt: "Hôm nay chỉ cần 1 nhiệm vụ thôi 💙". Quay lại: "Quay lại mạnh hơn 💪".
- Cần bộ copy riêng cho: tên các level ("Người mới bắt đầu" → "Nhà thám hiểm"…), empty state, thông báo, tên + mô tả badge.
- Wellbeing luôn kèm disclaimer; chỉ làm wellness phòng ngừa (stress nhẹ, burnout), không đi vào lâm sàng.

## 7. Accessibility

- Tương phản chữ/nền ≥ 4.5:1 (`#52525B` trên `#0D0D0F` thường **không đạt** cho chữ nhỏ).
- Vùng chạm ≥ 44pt.
- Không dùng màu làm tín hiệu duy nhất: Stamina cần icon/nhãn kèm màu; trạng thái node cần icon kèm viền.
- Hỗ trợ Dynamic Type và Reduce Motion.

---

## 8. Thứ tự refactor đề xuất

1. **Tokens**: chốt màu/chữ/spacing, sửa `bg-base` dark và màu Career (`src/ui/tokens/`, `config/branch-config.ts`).
2. **Component library** (mục 5) + bộ empty/loading/error.
3. **Skill Tree + Reveal** — ngôn ngữ visual chính của app.
4. **Home → Quests → Quest detail** + hoàn thành quest (A1), FAB (A4).
5. **Overlay thưởng**: level-up, streak, login bonus, combo.
6. **Profile**, badges, heatmap, weekly review.
7. **Paywall, share card, Luna** (có thể lượt sau).

**Đầu ra của lượt design:** tokens dark+light · component library có đủ state · 6 màn lõi độ hoàn thiện cao (Home, Skill Tree, Quests, Quest detail, Profile, Reveal) · các màn còn lại ở mức wireframe đúng token · prototype bấm được: Onboarding → Reveal → Home → Hoàn thành quest → Level-up → Profile.
