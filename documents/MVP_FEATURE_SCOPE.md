# Feature Scope & MVP Roadmap
**Ứng dụng:** Cây Kỹ Năng Cuộc Sống (Life Skill Tree)
**Thị trường:** Việt Nam · **Model:** Freemium + Premium · **Team:** 1–3 devs · **Timeline:** 3–4 tháng

---

## Nguyên tắc ưu tiên MVP

> Với team nhỏ 1–3 người trong 3–4 tháng, mục tiêu MVP là **chứng minh core loop hoạt động được** — không phải build full product. Core loop của app này là:
>
> **Onboard → Có Cây Kỹ Năng → Nhận Quest hàng ngày → Hoàn thành → Thấy tiến trình → Quay lại ngày mai**

---

## 🟢 P0 — Must Have (MVP v1.0)

*Không có những tính năng này, app không thể hoạt động.*

### 1. Onboarding & Skill Tree Generation (Đơn giản hóa)

**Mô tả:** Người dùng trả lời ~10 câu hỏi trắc nghiệm ngắn để hệ thống tạo Cây Kỹ Năng cá nhân hóa ban đầu.

| Thành phần | MVP Scope | Cắt bỏ cho v1 |
|---|---|---|
| Bài đánh giá tâm lý | 10 câu MCQ đơn giản | AI dynamic assessment |
| Tạo Skill Tree | 4 nhánh cố định (Career, Finance, Soft Skills, Wellbeing) | Nhánh tùy chỉnh người dùng tự thêm |
| AI personalization | Rule-based (dựa trên câu trả lời MCQ) | ML model thực sự |

**Business Rule:** Người dùng có thể skip onboarding và chọn nhánh thủ công — tránh friction ngay đầu.

---

### 2. Life Skill Tree — Core UI

**Mô tả:** Màn hình chính — hiển thị 4 nhánh kỹ năng dưới dạng cây/lưới với trạng thái locked/unlocked.

| Thành phần | MVP Scope |
|---|---|
| 4 nhánh kỹ năng | Career, Finance, Soft Skills, Wellbeing |
| Số node mỗi nhánh | 5–8 node (3 tầng: Beginner → Intermediate → Advanced) |
| Trạng thái node | Locked / In Progress / Completed |
| Mở khóa | Đủ XP threshold → unlock node tiếp theo |

**Cắt cho v1:** Animation Skill Tree phức tạp, nhánh con (sub-branches), custom node do người dùng tạo.

---

### 3. Daily Quests (Nhiệm vụ hàng ngày)

**Mô tả:** Mỗi ngày hệ thống giao 3–5 nhiệm vụ nhỏ tương ứng với các nhánh đang active.

| Thành phần | MVP Scope |
|---|---|
| Nguồn quest | Thư viện quest cố định (content team biên soạn ~200 quests ban đầu) |
| Phân bổ quest | Rule-based: phân bổ đều cho các nhánh người dùng đang focus |
| Loại quest | Checkbox (xác nhận tự báo cáo) — không verify bên ngoài |
| Thời lượng | 5–30 phút/quest |

**Ví dụ quests theo nhánh:**

- **Career:** "Đọc 1 bài về ngành mình quan tâm trong 15 phút"
- **Finance:** "Ghi lại 3 khoản chi tiêu hôm nay"
- **Soft Skills:** "Viết 3 điều mình đã làm tốt hôm nay"
- **Wellbeing:** "Thực hiện 5 phút thở sâu có hướng dẫn"

**Cắt cho v1:** AI-generated quests, quest từ external API (podcast, article), quest nhóm.

---

### 4. XP & Stamina System (Cơ chế cốt lõi)

**Mô tả:** Hệ thống điểm và thanh năng lượng — trái tim của gamification.

| Chỉ số | Mô tả | MVP Rule |
|---|---|---|
| XP | Điểm kinh nghiệm từ hoàn thành quest | +10–50 XP/quest tùy độ khó |
| Stamina Bar | Thanh sức khỏe tinh thần (0–100%) | Giảm nếu bỏ qua Wellbeing quests liên tục |
| Stamina Penalty | Debuff XP khi Stamina < 30% | XP nhận được từ Career/Finance giảm 50% |
| Stamina Recovery | Hoàn thành Wellbeing quest | +15 Stamina/quest |

**Wellbeing Scope giới hạn (v1):** Chỉ hỗ trợ stress nhẹ và burnout prevention. Hiển thị disclaimer rõ ràng: *"Ứng dụng này không thay thế tư vấn tâm lý chuyên nghiệp."* Nếu người dùng báo cáo trạng thái rất tiêu cực liên tục (3+ ngày), hiển thị link đường dây hỗ trợ tâm lý Việt Nam.

---

### 5. Growth Streak (Chuỗi duy trì)

**Mô tả:** Cơ chế giữ chân người dùng mỗi ngày.

- Streak tăng khi hoàn thành ít nhất **1 quest/ngày**
- Streak reset về 0 nếu bỏ 1 ngày (không có grace period ở v1)
- Micro-interaction tối thiểu: màn hình "Streak protected!" khi hoàn thành daily minimum

**Cắt cho v1:** Streak Shield (premium), Streak recovery bằng gems.

---

### 6. Auth & Profile (Cơ bản)

- Đăng ký/đăng nhập bằng email hoặc Google OAuth
- Profile đơn giản: avatar, tên, streak, tổng XP, level
- Không có social profile công khai ở v1

---

## 🟡 P1 — Should Have (MVP v1.1 — tháng 4–6)

*Quan trọng để retention, nhưng không blocking launch.*

### 7. Freemium Gate & Premium Subscription

| Tính năng | Free | Premium (~49k–99k VND/tháng) |
|---|---|---|
| Số nhánh Skill Tree | 2 nhánh | 4 nhánh + custom |
| Quest mỗi ngày | 2 quests | Không giới hạn |
| Streak Shield | ❌ | ✅ (1 lần/tuần) |
| Phân tích tiến trình | 7 ngày | 30 ngày + biểu đồ |
| Early access features | ❌ | ✅ |

---

### 8. Progress Analytics (Đơn giản)

- Biểu đồ XP theo tuần
- % hoàn thành mỗi nhánh
- Lịch sử streak

---

### 9. Push Notifications

- Nhắc nhở hoàn thành daily quest (người dùng chọn giờ)
- Cảnh báo "Stamina thấp" khi < 30%
- Thông báo streak milestone (7 ngày, 30 ngày, v.v.)

---

## 🔵 P2 — Nice to Have (v2.0 — tháng 7+)

*Những tính năng này tạo ra competitive moat nhưng cần product-market fit trước.*

### 10. Mentor Unlock System

Mở ra khi người dùng đạt Level 5 trên bất kỳ nhánh nào. Cần xây dựng riêng:
- Quy trình vetting mentor
- Scheduling system
- Review & rating
- Cơ chế compensation (split revenue hay flat fee)

> ⚠️ **Quyết định cần làm rõ:** Mentor được trả bằng gì? Tiền mặt, credit trong app, hay volunteer (như ADPList ban đầu)?

---

### 11. Guild System (Cộng đồng đồng cấp)

- Nhóm 5–10 người cùng nhánh kỹ năng
- Weekly team challenge
- Leaderboard trong guild (không public)

---

### 12. AI Personalization thực sự

- Dùng user behavior data để điều chỉnh quest difficulty
- NLP phân tích mood từ journal entries
- Predictive burnout detection

> ⚠️ **Lưu ý:** Cần ít nhất 3–6 tháng data người dùng thật trước khi ML model có ý nghĩa.

---

### 13. Chat UI / Voice UI

- AI companion để check-in hàng ngày thay thế form
- Dùng local LLM hoặc API (tùy chi phí)

---

## 🔴 Cắt hoàn toàn khỏi Roadmap v1

| Tính năng | Lý do cắt |
|---|---|
| Bảng xếp hạng công khai | Rủi ro toxic competition, cần moderation |
| Tích hợp third-party (Spotify, Health app) | Tăng scope quá nhiều |
| Content marketplace | Cần network effect trước |
| Web version | Mobile-first, tiết kiệm resource |

---

## 📦 MVP Delivery Checklist

```
[ ] Onboarding flow (10 câu MCQ → Skill Tree)
[ ] 4-nhánh Skill Tree UI (locked/unlocked/in-progress)
[ ] Thư viện 200 quests (nội dung tiếng Việt)
[ ] Daily quest assignment (rule-based)
[ ] XP system + level-up
[ ] Stamina bar + debuff logic
[ ] Growth Streak counter
[ ] Auth (Email + Google + Apple Sign-In)
[ ] Basic profile page
[ ] Wellbeing disclaimer + hotline redirect
[ ] Push notification (streak reminder)
```

---

## ✅ Quyết định đã chốt

| # | Câu hỏi | Quyết định |
|---|---|---|
| 1 | **Content pipeline** | AI-generated quests + human review/editorial oversight |
| 2 | **Platform** | React Native (Expo) — iOS first, sau đó Android |
| 5 | **Premium pricing** | 99k VND/3 tháng đầu (intro) → 99k VND/tháng thường |

---

## 🔗 Technical Reference

> Chi tiết kỹ thuật (platform, tech stack, code reuse strategy, backend, folder structure) được tách riêng tại:
> **[[TECHNICAL_ARCHITECTURE]]**

Tóm tắt quyết định platform:
- **Phase 1 (MVP):** React Native (Expo) — iOS first → App Store
- **Phase 2:** React Native — Android → Play Store
- **Backend:** Node.js (Fastify) + PostgreSQL (Supabase) — dùng chung iOS + Android

---

### 🟡 [PROPOSAL] Stamina Algorithm

Đề xuất công thức đơn giản, có thể implement ngay:

**Stamina decay mỗi ngày:**
```
Nếu user hoàn thành ≥ 1 Wellbeing quest trong ngày → Stamina +15, max 100
Nếu user bỏ qua toàn bộ Wellbeing quest → Stamina -10/ngày
Nếu user hoàn thành ≥ 3 Career/Finance quests mà 0 Wellbeing → Stamina -20/ngày ("grinding penalty")
```

**Stamina threshold effects:**
```
Stamina 70–100% → Normal (không có effect)
Stamina 30–69%  → Warning UI (thanh đổi màu vàng)
Stamina < 30%   → Debuff: XP từ Career/Finance giảm 50%
Stamina = 0%    → Hard gate: buộc hoàn thành 1 Wellbeing quest trước khi nhận Career quest mới
```

**Wellbeing trigger cho hotline:**
Nếu user chọn mood "Rất tệ" (trạng thái cực tiêu cực) **3 ngày liên tiếp** → hiển thị banner nhẹ nhàng kèm link tư vấn. Không interrupt flow.

> ✅ Algorithm này dễ implement (chỉ cần cron job hàng ngày), dễ tune sau khi có data thật.

---

### 🟡 [PROPOSAL] XP Economy

**Nguyên tắc thiết kế:** Level-up phải cảm thấy **nhanh ở đầu** (dopamine hit), **chậm dần ở sau** (long-term engagement).

**XP per quest theo độ khó:**
```
Easy (5–10 phút)   → +10 XP   (ví dụ: check-in mood, ghi 1 khoản chi tiêu)
Medium (15–20 phút) → +25 XP  (ví dụ: đọc bài nghiên cứu, lập budget tuần)
Hard (25–30 phút)  → +50 XP   (ví dụ: viết reflection dài, nghiên cứu thị trường)
```

**XP cần để lên Level (công thức lũy tiến):**
```
Level 1 → 2 : 100 XP   (~4–5 ngày)
Level 2 → 3 : 250 XP
Level 3 → 4 : 500 XP
Level 4 → 5 : 1,000 XP (~1 tháng dùng đều)
Level 5+    : +500 XP mỗi level (tuyến tính từ level 5 trở đi)
```

**Mở khóa theo Level:**
```
Level 2 → Unlock nhánh thứ 3 (Free tier chỉ có 2 nhánh)
Level 3 → Unlock Progress Analytics
Level 5 → Unlock Mentor System (v2.0)
Level 7 → Unlock Guild invite
```

> ✅ Không có XP inflation — XP chỉ từ quests, không mua được. Đây là tín hiệu chất lượng quan trọng với Mentor.

---

## 📦 MVP Delivery Checklist

```
[ ] Onboarding flow (10 câu MCQ → Skill Tree)
[ ] 4-nhánh Skill Tree UI (locked/unlocked/in-progress)
[ ] Thư viện 200 quests AI-generated + human-reviewed (tiếng Việt)
[ ] Daily quest assignment (rule-based)
[ ] XP system + level-up (theo bảng lũy tiến đề xuất)
[ ] Stamina bar + decay/recovery logic (theo algorithm đề xuất)
[ ] Growth Streak counter
[ ] Auth (Email + Google + Apple Sign-In)
[ ] Basic profile page
[ ] Wellbeing disclaimer + hotline redirect (trigger 3 ngày liên tiếp)
[ ] Push notification (streak reminder)
[ ] Pricing: 99k/3 tháng intro → 99k/tháng
```

---

*Generated: 2026-03-17 · Updated: 2026-03-17 · Context: BRIEF.md + Clarification Session*
