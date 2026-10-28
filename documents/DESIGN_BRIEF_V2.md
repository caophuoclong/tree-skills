# Design Brief v2 — Life Skill Tree (Cây Kỹ Năng Cuộc Sống)

**Mục đích:** một file duy nhất để (1) hiểu app đang ở đâu, (2) chốt danh sách feature nâng cấp, (3) chốt hướng design, rồi (4) làm bản design full và đánh giá xem codebase này có tái sử dụng để build thành product được không.

**Nguồn:** đọc `PRD_LifeSkillTree.md`, `MVP_FEATURE_SCOPE.md`, `DESIGN_SYSTEM.md`, `ENGAGEMENT_REDESIGN.md`, `ENHANCEMENT.md`, `features-enhance-v2.md`, `docs/feature-requests-v3.md`, `docs/preparing_features_v2.md`, `docs/bug-report.md`, `APP_ERD.md`, code trong `app/`, `src/`, `supabase/`, và 4 ảnh trong `evidences/`.

**Giới hạn:** mình chưa chạy app. Mọi nhận định về trạng thái dựa trên đọc code/doc và ảnh chụp tháng 3 trong `evidences/`. Chỗ nào chưa chắc đều ghi *(cần xác nhận)*.

> Theo `CLAUDE.md`: PRD là source of truth. Các chỗ code/doc mâu thuẫn PRD được liệt kê ở mục 5 để bạn quyết, mình không tự chọn.

---

## 1. Tóm tắt dự án

### 1.1 Sản phẩm là gì

App di động gamified cho Gen Z Việt Nam (18–27 tuổi), kết hợp **RPG Skill Tree** với **wellness tracking**. Người dùng chia mục tiêu lớn thành quest nhỏ hằng ngày, nhận XP để mở khóa node trên cây kỹ năng, và có thanh **Stamina/Mental Energy** để tránh burnout.

- **Vấn đề:** Gen Z bị "tê liệt" trước mục tiêu vĩ mô, dễ burnout, thiếu mentor.
- **Core loop:** Onboard → có Cây Kỹ Năng → nhận Quest hằng ngày → hoàn thành → XP + Stamina → quay lại ngày mai.
- **Mô hình:** Freemium + Premium (99k VND/tháng, qua RevenueCat). Free = 2 nhánh, 3 quest/ngày. Premium = 4 nhánh, 5 quest/ngày, streak shield, analytics 30 ngày.
- **4 nhánh:** Career · Finance · Soft Skills · Wellbeing. Mỗi nhánh 5–8 node, 3 tầng Beginner → Intermediate → Advanced.
- **Điểm khác biệt:** Stamina tự cân bằng (làm quá nhiều Career/Finance mà bỏ Wellbeing thì bị phạt XP), thay vì chỉ cổ vũ cày.

### 1.2 Đã build những gì

**Màn hình (Expo Router, `app/`):**

| Nhóm | Màn hình |
|---|---|
| Auth/Onboarding (9) | splash, welcome, login, register, forgot-password, onboarding, assessment (10 câu MCQ), generating, reveal |
| Tab chính (4 + FAB) | Home (bento), Skill Tree, Quests, Profile, nút FAB giữa |
| Chi tiết | branch/[id], node-detail, quest/[id] |
| Phụ | leaderboard, notifications, roadmap (mục tiêu ngắn/trung/dài hạn), settings, wellbeing (hotline, self-care), skill-builder (3 màn: nhập mục tiêu → AI sinh cây riêng → chỉnh sửa), oauth consent/update-password |

**Component (atomic design, `src/ui/`):** 16 atoms, 38 molecules, 23 organisms. Có sẵn: ProgressRing, XPShimmerBar, StaminaBar, StreakBadge/Shield/Chain, ComboBar, LevelUpModal, LoginBonusModal, QuickQuestBanner, DailyMoodCheckIn, DailyBriefCard, WeeklyReviewModal, HabitHeatmap, NodeDetailModal, ConfettiOverlay, ChallengeCard.

**Logic (`src/business-logic/`):** stores Zustand (user, quest, skillTree, challenge, mood, notification, roadmap, settings, theme, onboarding, customSkillTree), hooks (useXPEngine, useStaminaSystem, useGrowthStreak, useQuestManager, useAdaptiveDark…), services gọi Supabase, tầng mock axios cho dev.

**Backend (Supabase):** 27 migration (profiles, skill_nodes, quests, challenges, user_*, streak_history, daily_bonuses, notifications, master_data, assessment, system_prompts, ai_providers, RPC tính XP/onboarding, RLS) + 4 Edge Function AI: `generate-skills`, `generate-quests`, `generate-challenges`, `onboarding-generate`. Có workflow deploy trong `.github/workflows/`.

**Nội dung:** thư viện client nhỏ (~38 quest, ~58 node, 4 challenge) và 10 câu assessment tiếng Việt. PRD yêu cầu ~200 quest, tức là còn thiếu nhiều, nhưng đã có Edge Function để sinh thêm.

### 1.3 Trạng thái thật (đừng tin checkbox trong TODO)

`TODO.md` chỉ tick 1/300 mục và `todo-enhance-v2.md` tick 7/111, dù code đã có nhiều feature trong đó. **Hai file này đã lỗi thời.** Nguồn đáng tin hơn là `docs/preparing_features_v2.md` (gap analysis) và code:

| Feature | Trạng thái |
|---|---|
| Streak, shield, login bonus, combo, mood check-in, quick quest, weekly review, heatmap, level-up | Có code *(cần xác nhận chạy đúng)* |
| Challenges | ~80%, backend còn thiếu |
| Notifications | ~60%, chưa có push thật/scheduling |
| Profile/Avatar | ~60% |
| Badges | Chỉ có UI, chưa có bảng DB, tính phía client |
| Leaderboard | Mock, không có backend |
| Shareable cards, Focus week, Events | Chưa bắt đầu |
| Paywall / RevenueCat / Apple Sign-In | Không thấy trong code *(cần xác nhận)* |

### 1.4 Vấn đề nhìn thấy trong ảnh `evidences/` (tháng 3, cần chạy lại để xác nhận)

1. Icon hiển thị thành ô vuông `?` ở Home, Quests, Profile (streak, mental energy, challenges). Nhiều khả năng icon font chưa load.
2. Skill Tree: pill "Well-being" bị cắt mép phải, vùng giữa trống lớn, node chỉ là vòng tròn có `?`.
3. Quests: empty state "No quests yet" dù Home báo 3 pending, nghĩa là state không đồng bộ giữa các tab.
4. Home: nửa dưới trống sau banner; ring branch đều 0% nhưng Profile báo 80/60/40/30%.
5. Dữ liệu demo cứng ("Alex Kim", "Premium · Active · Renews Apr 17").
6. Trộn tiếng Anh/Việt ("Today's Quests", "No quests yet", "Skill Branch Progress") trong app tiếng Việt. Một số label đã ghi trong ENHANCEMENT E9 nhưng chưa sửa hết.
7. Visual phẳng, đúng như `ENGAGEMENT_REDESIGN.md` mô tả: card tối đồng màu, ít chiều sâu, màu branch chỉ xuất hiện ở chấm nhỏ.

---

## 2. Có tái sử dụng để build thành product được không?

**Kết luận: được, và nên tái sử dụng phần lớn, nhưng phải dọn 3 thứ trước khi coi là product.** Đánh giá dựa trên đọc code, chưa chạy build.

### 2.1 Giữ lại (giá trị cao)

| Thành phần | Lý do |
|---|---|
| Tách `business-logic` / `ui` + atomic design | Đổi giao diện mà không đụng logic. Phù hợp để thay design mới. |
| Schema Supabase + RLS + RPC XP | Gần đủ cho MVP, có ERD (`APP_ERD.md`). |
| 4 Edge Function AI + `system_prompts`, `ai_providers` | Sinh quest/skill động, prompt chỉnh được qua DB, không cần redeploy. |
| Token color/spacing/motion (`src/ui/tokens/`) | Có dark + light, branch color, motion; chỉ cần chọn lại hướng visual. |
| 10 câu assessment + logic map nhánh | Đúng PRD. |
| Tài liệu sản phẩm (PRD, MVP scope, v3 retention) | Chất lượng tốt, thiếu chỉ là đồng bộ. |

### 2.2 Phải dọn trước khi build product

1. **Hai hướng design đang cùng tồn tại.** Doc nói dark-first + glassmorphism + Clash Display/Inter/JetBrains Mono + Tamagui. Code thật dùng Neobrutalism (hard shadow, viền dày) + Space Grotesk/Space Mono, `NeoBrutalBox` dùng ở 38 file, `GlassView` ở 1 file, Tamagui có trong `package.json` nhưng UI chạy bằng atoms tự viết. Phải chọn một (mục 4.1).
2. **Mock vs thật.** Tầng `axios-mock-adapter` (`api/mock/`) vẫn còn trong repo, hiện đang bị comment tắt ở `app/_layout.tsx`, và có thư viện quest/node cục bộ (`data/`). Cần xác định đường dữ liệu chính thức là Supabase, rồi xóa hoặc cô lập mock/fallback để không lẫn vào bản product.
3. **Doc và code lệch nhau** (mục 5): luật streak, combo, branch color, shield, leaderboard. Không chốt thì design và code sẽ tiếp tục kéo ngược nhau.

### 2.3 Còn thiếu để gọi là product (không phải design)

Paywall + RevenueCat, Apple Sign-In (bắt buộc nếu có Google trên iOS), push notification thật, analytics/event tracking (không có thì không đo được D1/D7), bảng badges, nội dung ~200 quest đã review, crash reporting, màn hình privacy/điều khoản và disclaimer wellbeing, kiểm tra EAS build cho iOS/Android.

### 2.4 Cách kiểm chứng nhanh (đề xuất)

| Bước | Việc | Kết quả cần có |
|---|---|---|
| 1 | Chạy app thật, quay video 4 tab + onboarding, đối chiếu mục 1.4 | Danh sách lỗi đã xác nhận |
| 2 | Chốt mục 4.1 + 5, làm design full theo mục 4 | Bộ design (Figma/Stitch) + token mới |
| 3 | Áp token mới vào `src/ui/tokens/` trước, rồi thay 6 màn cốt lõi (Home, Tree, Quests, Quest detail, Profile, Reveal) | Bản build chạy được |
| 4 | Bật analytics + cho 15–30 người dùng thử 2 tuần | Đo bên dưới |

**Tiêu chí go/no-go gợi ý:** ≥ 60% người thử hoàn thành onboarding; ≥ 40% hoàn thành ≥ 1 quest trong ngày 1; D7 ≥ 20%; người dùng tự mô tả được "Stamina" làm gì. Đây là ngưỡng đề xuất để bạn chỉnh, không phải số liệu từ tài liệu.

---

## 3. Feature nâng cấp (đã gộp và xếp ưu tiên)

Gộp từ `ENHANCEMENT.md` (E1–E15), `ENGAGEMENT_REDESIGN.md` (V1–V6, G1–G10), `features-enhance-v2.md`, `feature-requests-v3.md`, `preparing_features_v2.md`, cộng đề xuất của mình (đánh dấu **[mới]**). Cột "Code" cho biết đã có hay chưa để design biết cần vẽ mới hay vẽ lại.

### 3.1 Nhóm A — Làm cho core loop chạy đúng và "đã" (bắt buộc trước khi ra product)

| # | Feature | Code | Ghi chú cho design |
|---|---|---|---|
| A1 | Quest complete feedback: XP bay lên, ring cập nhật, confetti khi xong hết ngày, haptic | Có (ConfettiOverlay, XP engine) | Đây là khoảnh khắc dopamine chính. Vẽ đủ trạng thái: idle → pressed → done → +XP → combo. |
| A2 | Skill Node bottom sheet (mô tả, quest liên quan, XP để mở, CTA "Bắt đầu") | Có (NodeDetailModal, SkillNodeSheet) | Có 4 state: locked / sẵn sàng mở khóa / đang học / hoàn thành. |
| A3 | Home luôn đầy: preview 2–3 quest có checkbox, "Xem tất cả" | Có một phần | Home không được có vùng trống. Vẽ cả trạng thái 0 quest. |
| A4 | FAB quick menu: Log hoạt động · Quest gợi ý · Mood check-in | Placeholder | Hiện FAB bấm không làm gì. Phải có hành vi, nếu không thì bỏ. |
| A5 | Notification center + badge chưa đọc | Có (60%) | Có empty state. |
| A6 | Level-up screen + title theo level | Có | Tên level ("Người mới bắt đầu" → "Nhà thám hiểm"…) cần bộ copy. |
| A7 | Nhất quán ngôn ngữ (Việt) và sửa icon lỗi | Một phần | Mọi label phải qua i18n, không hard-code. |
| A8 | Empty / loading / error / offline cho mọi list | Thiếu | Hiện nhiều nơi spinner vô tận hoặc trắng. Vẽ bộ state chung. |

### 3.2 Nhóm B — Giữ chân (retention)

| # | Feature | Code | Ghi chú |
|---|---|---|---|
| B1 | Quick Quest 5 phút (cứu ngày mệt) | Có | Banner khi 0 quest hôm nay. |
| B2 | Streak recovery: grace day, comeback bonus, preview mốc | Một phần (shield, shame modal, milestone preview) | Chờ quyết mục 5 (xung đột PRD). |
| B3 | Mood check-in → gợi ý quest (+5 XP) | Có (record), chưa hành động | Mood xấu → Wellbeing quest, thông điệp ấm. |
| B4 | Daily brief "3 điều quan trọng hôm nay" | Có | Hiển thị một lần/ngày, dismiss được. |
| B5 | Weekly review (modal thứ Hai + vào từ Profile) | Có | Framing tích cực, không so sánh với người khác. |
| B6 | Habit heatmap 4–12 tuần | Có | Tap ngày xem chi tiết theo nhánh. |
| B7 | Local push: streak sắp mất, nhắc sáng, mốc ngày mai, weekly (tối đa 1/ngày, 8h–21h) | Có code lên lịch (`useLocalNotifications`) *(cần xác nhận chạy thật)* | Cho phép bật/tắt từng loại trong Settings. |
| B8 | Streak/Stamina visual: lửa animate, shield, cảnh báo đỏ khi sắp mất | Có một phần | Đừng gây lo âu: nguyên tắc "Calm by default". |
| B9 | Contextual quest ordering (giờ, cuối tuần, streak sắp mất) + nhãn "✦ Gợi ý hôm nay" | Chưa | Chỉ sắp xếp lại, không ẩn. |
| B10 | Smart difficulty (completion rate 7 ngày) | Chưa | Không thông báo thay đổi cho người dùng. |
| B11 | Quest bookmark "Để sau" | Chưa | Mục thu gọn dưới danh sách. |
| B12 | Offline queue + chỉ báo "Đồng bộ đang chờ" | Chưa | Không modal lỗi. |

### 3.3 Nhóm C — Tăng trưởng và doanh thu

| # | Feature | Code | Ghi chú |
|---|---|---|---|
| C1 | Badges thật (DB + unlock + showcase 3 badge) | Chỉ UI | Locked: mờ, ẩn tên để tạo tò mò. |
| C2 | Share Progress Card (ảnh cho Stories: avatar, level, streak, nhánh mạnh nhất) | Không | Vòng viral rẻ nhất. Vẽ 3 template tỉ lệ 9:16. |
| C3 | Paywall + trang Premium (so sánh Free/Premium, giá 99k) | Không | **[mới]** Điểm chạm doanh thu duy nhất, chưa có. Đặt ở: mở nhánh 3–4, shield, analytics 30 ngày. |
| C4 | Avatar frame theo level/streak | Một phần | Cần bộ frame (tím, Career, Finance, On Fire, Diamond). |
| C5 | Mascot Luna: idle, celebrate, sleepy, cheer, levelup | Không | Cần 5 state minh họa. Quan trọng cho cá tính thương hiệu và cho Wellbeing. |
| C6 | Branch Focus Week (+20% XP nhánh chọn) | Không | Thay thế "Power Hour" nếu muốn giữ app bình tĩnh. |
| C7 | Quest story chains (3 quest nối tiếp) | Không | Hiển thị "Phần 1/3". |
| C8 | Mastery cho node (1–3 sao) | Không | Để sau. |
| C9 | Onboarding 2.0: chọn giai đoạn (sinh viên/đi làm), mục tiêu, nỗi đau, định dạng nội dung, MBTI (tùy chọn) | Có schema `user_onboardings`, code onboarding đã đọc `career_stage` | **[mới]** Hai luồng onboarding (10 câu MCQ theo PRD và luồng chọn thuộc tính theo migration 012) cùng tồn tại; cần chốt luồng nào là chính, xem mục 5 #13. |
| C10 | Skill Builder (cây riêng bằng AI) hoàn thiện, vào từ tab Cây | Có (đang mở từ `GoalFilterSection`) | Theo E9 v2: pill "Default / Custom" trên tab Cây. Đây là feature khác biệt, nên đưa lên rõ hơn. |

### 3.4 Không làm / để sau (theo PRD)

Bảng xếp hạng công khai (PRD đã cắt vì rủi ro toxic, nhưng app đang có màn leaderboard, xem mục 5), Mentor system, Guild, AI chat companion, web version, tích hợp bên thứ ba, "Power Hour" (tạo FOMO, ngược nguyên tắc Calm), social proof "234 người đã làm" (cần user base trước).

---

## 4. Hướng design cập nhật

### 4.1 Quyết định chính: một hướng visual

Hiện có hai hướng chạy song song. **Đề xuất: "Calm base, punchy rewards".**

- **Nền, card, điều hướng:** dark-first + glass nhẹ + glow theo màu nhánh (theo `DESIGN_SYSTEM.md` và `ENGAGEMENT_REDESIGN.md`). Hợp nguyên tắc *Calm by default* và nội dung Wellbeing.
- **Khoảnh khắc thưởng** (CTA chính, hoàn thành quest, level-up, streak milestone, paywall): dùng hard-shadow/viền đậm kiểu Neobrutalism hiện có để tạo "cú bấm" rõ.
- Lý do: Neobrutalism thuần mạnh, ồn, đi ngược "calm" khi người dùng đang stress. Giữ được `NeoBrutalBox` ở vai trò nhỏ nên không phải vứt code. Chi phí thật: phần lớn trong 38 file đang dùng `NeoBrutalBox` sẽ cần đổi sang card glass, đây là việc refactor chính.
- **Phương án B (rẻ hơn):** giữ Neobrutalism toàn app, chỉ sửa tính nhất quán + thêm glow. Chọn nếu mục tiêu là ra bản thử nhanh. Đánh đổi: khó truyền tải cảm giác "an toàn" cho Wellbeing.

### 4.2 Nguyên tắc (giữ 5 cái cũ, thêm 2)

1. Calm by default · 2. Progress is visible · 3. Friction is intentional · 4. Reward the act, not the result · 5. Dark-first, eye-safe
6. **Forgive, don't punish** *(từ v3)*: bỏ lỡ ngày, mất streak không được trình bày như thất bại.
7. **Keep users inside** *(từ v3)*: mọi vòng lặp hoàn tất trong app, không đẩy ra ngoài mới nhận giá trị.

### 4.3 Token (giữ từ `src/ui/tokens/`, chỉ sửa chỗ lệch)

**Màu dark (mặc định):**

| Token | Giá trị | Dùng cho |
|---|---|---|
| bg-base | `#0D0D0F` (ban đêm) / `#121214` (ban ngày) | Nền. Code đang để `#2b2b2e` ở dark, **lệch doc, cần sửa** |
| bg-surface | `#161618` | Card, sheet |
| bg-elevated | `#1E1E22` | Modal |
| brand-primary / glow | `#7C6AF7` / `#A89BFA` | CTA, tab active, level |
| career | `#4DA8FF` | Nhánh Sự nghiệp |
| finance | `#34D399` | Nhánh Tài chính |
| softskills | `#FBBF24` | Nhánh Kỹ năng mềm |
| wellbeing | `#F472B6` | Nhánh Sức khỏe |
| success / warning / danger | `#34D399` / `#FBBF24` / `#F87171` | Trạng thái; Stamina ≥70 / 30–69 / <30 |
| text 1 / 2 / muted | `#F4F4F5` / `#A1A1AA` / `#52525B` | Muted chỉ cho nội dung phụ, kiểm tra tương phản |
| glass | bg `rgba(255,255,255,.05–.08)`, viền `rgba(255,255,255,.08–.12)`, blur 12–20 | Card |

**Light mode:** đã có trong code (`bgBase #F8F9FA`, text `#111827`, branch đậm hơn một bậc). Design cần vẽ **cả hai** theme. `useAdaptiveDark` hiện đổi nền theo giờ, hãy quyết định có giữ không.

**Lỗi cần sửa ở design, không chỉ code:** `branch-config.ts` đặt Career `#7C6AF7` (trùng brand) và Finance `#22C55E`, lệch token `#4DA8FF` / `#34D399`. Career trùng màu brand sẽ làm tab/CTA và nhánh Career nhìn như một.

**Chữ:** giữ **Space Grotesk** (display + body) và **Space Mono** (số: XP, level, streak) vì đã load trong code. `DESIGN_SYSTEM.md` ghi Clash Display/Inter/JetBrains Mono nhưng code không dùng. Thang cỡ giữ nguyên: 32 / 24 / 20 / 16 / 14 / 12 / 10. Phải kiểm tra render dấu tiếng Việt ở mọi cỡ, đặc biệt chữ hoa `micro` có letter-spacing.

**Spacing/Radius/Motion:** base 4dp; 4/8/16/24/32/48/64; lề màn hình 20; gap card 12; radius 8/12/16/24/full. Spring bounce `{300,20}`, spring smooth `{200,30}`; thời lượng 150/300/600/800ms. Mọi animation phải có phương án **reduce motion**.

**Icon:** hiện trộn Ionicons + emoji + SVG tự vẽ. Chọn một bộ line icon cho UI, emoji chỉ dùng trong nội dung (quest, mood). Ảnh evidence cho thấy icon vỡ thành `?`, nên bộ icon mới cần có phương án fallback.

### 4.4 Skill Tree (màn hero, ưu tiên số 1 của design)

Hiện là list vòng tròn rời. Cần thành **cây thật**:

- Đường nối cong có glow theo màu nhánh; khi mở khóa, ánh sáng chạy từ node cha xuống con.
- 5 trạng thái node: Locked (mờ, khóa) · Sẵn sàng mở khóa (shimmer, nhãn "Đủ XP") · Đang học (viền gradient + pulse) · Hoàn thành (fill + check + hạt sáng) · Mastered (sao, v2).
- Silhouette cây mờ phía sau; ảnh nền ambient theo nhánh đang chọn.
- Tab nhánh không bị cắt, tab active có glow đúng màu nhánh. Có chuyển "Mặc định | Tùy chỉnh" cho cây AI.
- Màn reveal onboarding (hạt giống → cây) dùng lại đúng ngôn ngữ visual này.
- Tham khảo: Genshin talent tree, Path of Exile passive tree (bản đơn giản).

### 4.5 Danh sách màn hình cần design

Mỗi màn cần vẽ: **default, loading, empty, error, offline** (A8), dark và light.

| Màn | Nội dung chính | Cần vẽ thêm / sửa |
|---|---|---|
| Splash, Welcome | Logo, tagline, hero | Luna xuất hiện lần đầu |
| Login/Register/Forgot | Email, Google, Apple | Nút Apple bắt buộc; lỗi form |
| Assessment (10 câu) | 1 câu/màn, "Câu 3/10", quay lại, Bỏ qua ở câu 1 | Hiển thị ngay là không có đáp án đúng sai |
| Generating + Reveal | Loading 2–3s, hạt → cây | Lottie/animation, bản "AI chậm/lỗi" |
| **Home (bento)** | Header (level, chuông, cài đặt), 4 ring nhánh, streak, Stamina, quest hôm nay, XP, daily brief, quick quest banner | Bố cục không có vùng trống; trạng thái stamina thấp |
| **Skill Tree** | Mục 4.4 | Pill Mặc định/Tùy chỉnh |
| Branch detail, Node sheet | Mô tả, quest liên quan, CTA | 4 state node |
| **Quests** | Tiến độ ngày, combo, danh sách, challenges, "Để sau", banner Wellbeing | Hard gate khi Stamina = 0 |
| **Quest detail** | Vì sao quan trọng, các bước, tài nguyên, nút hoàn thành | Chuỗi quest "Phần 1/3"; đủ state nút |
| Challenges | Tiến độ ngày X/Y, đếm ngược, XP, Join/Leave, Ended | |
| **Profile** | Avatar + frame, level, streak, 4 stat, tiến độ nhánh, badges, heatmap, biểu đồ tuần | Gói Premium thật, không hard-code |
| Badges | Lưới 4 cột, locked ẩn tên | Popup khi mở khóa |
| Notifications | Danh sách theo loại, đọc/chưa đọc | Empty "Bạn đã xem hết" |
| Roadmap | Mục tiêu ngắn/trung/dài hạn | |
| Wellbeing | Hotline, self-care, banner nhẹ khi mood xấu 3 ngày | Giọng văn ấm; có disclaimer bắt buộc |
| Settings | Theme, thông báo từng loại, tài khoản, ngôn ngữ | |
| Skill Builder (3 màn) | Mục tiêu → AI sinh → chỉnh sửa | Thêm lối vào từ tab Cây |
| Leaderboard | Rank của bạn, khoảng cách tới người trên | Chỉ làm nếu quyết giữ (mục 5) |
| **Paywall/Premium** | So sánh gói, giá, CTA | Mới (C3) |
| **Overlay/Modal** | Level-up, login bonus, streak milestone, weekly review, streak shield/recovery, share card, FAB menu | Mới/đồng bộ style |

### 4.6 Hệ thống component (bản đồ từ code → design)

Dựng library trước, rồi lắp màn: `Button` (primary/secondary/ghost/danger, pressed), `Card` (glass/solid/accent-left-bar), `SkillNode` (5 state), `QuestCard`, `ProgressRing`, `XPBar`, `StaminaBar` (3 ngưỡng), `StreakBadge` (+shield, +at-risk), `ComboBar`, `Badge/Pill` (XP, tier, thời lượng), `BottomSheet`, `Modal`, `Toast`, `Tab/Pill nhánh`, `Avatar+Frame`, `EmptyState` (kèm Luna), `Skeleton`, `Checkbox` (spring), `Tag "Gợi ý hôm nay"`.

### 4.7 Motion, haptic, âm thanh

Giữ bảng micro-interaction trong `DESIGN_SYSTEM.md §6` (quest complete 300ms spring, XP count-up 600ms, level-up 800ms, node unlock 500ms, stamina shake 400ms, streak bounce 350ms). Haptic: quest = Light, level up = Success, stamina cảnh báo = Warning, streak = Medium. Âm thanh tùy chọn, mặc định tắt.

### 4.8 Nội dung và giọng văn

Tiếng Việt, thân thiện, không phán xét. Mẫu: mất streak → "Streak ngủ quên hôm qua 😅", ngày mệt → "Hôm nay chỉ cần 1 nhiệm vụ thôi 💙". Wellbeing luôn kèm: *"Ứng dụng này không thay thế tư vấn tâm lý chuyên nghiệp."* App chỉ làm wellness phòng ngừa, không đi vào clinical. Cần bộ copy cho level title, empty state, thông báo, badge.

### 4.9 Accessibility

Tương quan chữ/nền ≥ 4.5:1 (kiểm tra `text-muted #52525B` trên `#0D0D0F`, thường không đạt cho chữ nhỏ), vùng chạm ≥ 44pt, không dùng màu là tín hiệu duy nhất (Stamina cần icon/nhãn kèm màu), hỗ trợ Dynamic Type và Reduce Motion.

---

## 5. Quyết định cần bạn chốt (doc/code đang mâu thuẫn)

Mình không tự chọn vì `CLAUDE.md` yêu cầu hỏi khi PRD thiếu hoặc xung đột. Cột "Đề xuất" là mặc định mình sẽ dùng để làm design nếu bạn chưa trả lời.

| # | Vấn đề | Các nguồn nói gì | Đề xuất |
|---|---|---|---|
| 1 | **Hướng visual** | Doc: glass + Clash/Inter. Code: Neobrutalism + Space Grotesk | Mục 4.1 "Calm base, punchy rewards" |
| 2 | **Streak** | PRD: không grace period ở v1, reset khi bỏ 1 ngày. v3: grace day + comeback. Code: 2 shield | Dùng grace day + comeback; bản thử không có grace sẽ làm người dùng bỏ app |
| 3 | **Streak shield** | PRD: Premium, 1 lần/tuần. G6: Free 1/tháng, Premium không giới hạn. Code: tối đa 2 | Free 1/tháng, Premium 1/tuần |
| 4 | **Combo multiplier** | G2: ×1.5 (3 quest), ×1.75 (4), ×2 (5+). v2: ×1.25 (3), ×1.5 (5) | G2, nhưng phải kiểm với kinh tế XP/level (PRD §2.4) |
| 5 | **Leaderboard** | PRD: đã cắt vì toxic. Code + E10/E15: đang có và mở rộng | Giữ màn nhưng ẩn bản thử; nếu giữ thì chỉ "bạn bè/nhóm", không public |
| 6 | **Mở nhánh** | PRD: Free 2 nhánh, nhưng "Level 2 mở nhánh 3 cho Free" | Free 2 nhánh cố định; Level 2 mở node tier cao |
| 7 | **Màu Career** | `branch-config.ts` `#7C6AF7` vs token `#4DA8FF` | `#4DA8FF` |
| 8 | **Hotline** | PRD P6: số ngày "rất tệ" liên tiếp chưa chốt (ghi 3). Code dùng `1800 599 920` | 3 ngày; xác minh số điện thoại trước khi phát hành |
| 9 | **Power Hour (G7)** | Backlog "Medium"; ngược nguyên tắc Calm | Bỏ, thay bằng Focus Week |
| 10 | **Platform ưu tiên** | PRD: iOS first, Android phase 2 | iOS trước |
| 11 | **UI library** | Doc: Tamagui. Code: atoms tự viết, Tamagui chỉ trong `package.json` | Giữ atoms, gỡ Tamagui nếu không dùng |
| 12 | **Tên sản phẩm** | Repo `tree-skills`, package `life-skills`, doc "Life Skill Tree" | Chốt tên khi làm logo |
| 13 | **Luồng onboarding** | PRD: 10 câu MCQ map vào nhánh. Migration 012/013: giai đoạn, mục tiêu, nỗi đau, định dạng, MBTI | Giữ MCQ làm lõi, thêm 2–3 câu thuộc tính nếu AI cần để cá nhân hóa; không để người dùng làm hơn ~12 bước |

---

## 6. Cách dùng file này để làm bản design full

**Đầu ra mong đợi của lượt design:**
1. Design tokens (dark + light) khớp `src/ui/tokens/`.
2. Component library (mục 4.6) có đủ state.
3. 6 màn lõi, độ hoàn thiện cao: Home, Skill Tree, Quests, Quest detail, Profile, Reveal.
4. Các màn còn lại ở mức wireframe chuẩn token (mục 4.5).
5. Prototype có thể bấm cho luồng: Onboarding → Reveal → Home → Hoàn thành quest → Level-up → Profile.
6. 3 template Share Card + 5 state Luna (có thể để lượt sau).

**Thứ tự đề xuất:** (1) Chốt mục 5 → (2) tokens + component → (3) Skill Tree + Reveal (ngôn ngữ visual chính) → (4) Home/Quests/Quest detail → (5) overlay thưởng → (6) còn lại.

**Gợi ý khi dùng công cụ AI design:** `documents/PROMPT_DESIGN.md` đã có prompt mẫu và project Stitch (`projects/7641792071217503464` được nhắc trong `TODO.md`). Cập nhật prompt theo mục 4.1–4.4 trước khi chạy lại, nếu không kết quả sẽ quay về hướng glass/Clash cũ.

**Khi chuyển design sang code:** sửa `src/ui/tokens/colors.ts` trước (cả app ăn theo), sửa `branch-config.ts`, rồi thay từng organism. Không đổi `business-logic/`.

---

## 7. Gợi ý cập nhật tài liệu gốc

- `TODO.md`, `todo-enhance-v2.md`: tick lại theo thực tế hoặc thay bằng bảng 1.3.
- `DESIGN_SYSTEM.md`: ghi đúng font/hướng visual sau khi chốt mục 4.1.
- `PRD_LifeSkillTree.md`: cập nhật theo các quyết định #2–#6 và #13 ở mục 5 sau khi bạn chốt.
