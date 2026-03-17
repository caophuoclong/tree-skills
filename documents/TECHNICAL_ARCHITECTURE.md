# Technical Architecture
**Ứng dụng:** Cây Kỹ Năng Cuộc Sống (Life Skill Tree)
**Cập nhật lần cuối:** 2026-03-17

---

## Lộ trình Platform

```
Phase 1 (Tháng 1–3)  →  React Native — iOS first (App Store)
Phase 2 (Tháng 4–6)  →  React Native — Android (Play Store) + refine
Phase 3 (Tháng 7+)   →  Scale, AI features, Guild system
```

---

## Frontend — React Native (iOS + Android)

### Lý do chọn React Native
- Một codebase cho cả iOS + Android
- Expo managed workflow → đơn giản hóa build & deploy, không cần Xcode/Android Studio phức tạp
- JavaScript/TypeScript ecosystem → dễ tìm developer
- Full control UX: animation, haptic feedback, offline mode — không bị giới hạn như ZMP
- Bento Grid, Glassmorphism, Micro-interactions từ BRIEF đều khả thi hoàn toàn

### Tech Stack
```
Framework   : React Native (Expo SDK — managed workflow)
UI Library  : Tamagui (atomic design pattern, universal tokens)
Navigation  : React Navigation v7
Auth        : Supabase Auth (email + Google + Apple Sign-In)
Notification: Expo Push Notifications (FCM + APNs)
Payment     : RevenueCat — quản lý subscription iOS + Android
State Mgmt  : Zustand
API Client  : Axios + TanStack Query (React Query)
```

### Folder Structure
```
src/
├── business-logic/       ← Core app logic — tách biệt hoàn toàn khỏi UI
│   ├── hooks/            (useQuestManager, useStaminaSystem, useXPEngine…)
│   ├── services/         (QuestService, UserService, NotificationService…)
│   ├── stores/           (Zustand: userStore, questStore, progressStore…)
│   ├── api/              (Axios clients, React Query config)
│   └── types/            (TypeScript interfaces & enums)
│
└── ui/
    ├── components/       (reusable UI components)
    ├── screens/
    └── navigation/
```

### Deployment
```
iOS    : Expo EAS Build → TestFlight → App Store (Apple review ~1–3 ngày)
Android: Expo EAS Build → Internal Testing → Play Store
OTA    : Expo Updates — push JS bundle updates không cần re-submit store
```

> 💡 **Expo OTA Updates** là lợi thế lớn cho team nhỏ: bug fix và content updates không cần chờ App Store review lại.

---

## Backend

*Xây một lần, dùng cho cả iOS lẫn Android.*

```
Runtime     : Node.js + Fastify  (lightweight, phù hợp team nhỏ)
Database    : PostgreSQL via Supabase — user data, quests, progress, XP
Cache       : Redis (Upstash) — streak counter, stamina state, daily quest pool
Auth        : Supabase Auth (JWT)
AI/LLM      : mlx-lm (local, MacBook M4 Pro) cho quest generation offline
              OpenAI API làm fallback khi cần scale
Hosting     : Railway (auto-deploy từ GitHub, free tier đủ cho MVP)
Storage     : Supabase Storage — avatar, media assets
```

### Core API Endpoints (draft)
```
POST /auth/login
GET  /users/:id/skill-tree
GET  /quests/daily              — lấy quest hôm nay (rule-based)
POST /quests/:id/complete       — ghi nhận hoàn thành, tính XP + Stamina
GET  /users/:id/progress        — XP, level, streak, stamina
POST /users/:id/mood-checkin    — daily mood (trigger Wellbeing logic)
```

---

## ✅ Quyết định kỹ thuật đã chốt

| # | Quyết định | Kết quả |
|---|---|---|
| T2 | Hosting | **Self-host** — owner có DevOps skills, giảm chi phí |
| T4 | RN UI Library | **Tamagui** — phù hợp atomic design pattern |

## ⏳ Quyết định còn mở

| # | Quyết định | Options | Ưu tiên |
|---|---|---|---|
| T1 | Backend framework | Fastify (lightweight) vs NestJS (structured, nếu team mở rộng) | 🟡 High |
| T3 | LLM quest generation | mlx-lm local (cost = 0, MacBook M4 Pro) vs OpenAI API (dễ scale) | 🟠 Defer |

---

*Tài liệu này được reference bởi [[MVP_FEATURE_SCOPE]]*
