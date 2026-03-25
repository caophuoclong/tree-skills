# Refactoring Plan — Clean Architecture Migration

## Overview

This document defines the migration path from the current flat `src/business-logic` + `src/ui` structure to a feature-sliced clean architecture. The goal is to enforce strict dependency rules, isolate concerns per feature, and make each feature independently testable and deployable.

---

## Target Directory Structure

```
src/
├── core/                          # Shared cross-feature code
│   ├── constants/
│   ├── errors/
│   ├── types/                     # Shared primitive types
│   └── utils/
│
├── features/
│   ├── auth/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── quest/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── skill-tree/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── user/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── challenge/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── onboarding/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   └── roadmap/
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       └── presentation/
│
├── navigation/                    # Route definitions and guards
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── TabNavigator.tsx
│
├── store/                         # Global Zustand stores
│   ├── userStore.ts
│   ├── sessionStore.ts            # Auth session only
│   └── index.ts
│
└── ui/                            # Design system (unchanged hierarchy)
    ├── atoms/
    ├── molecules/
    ├── organisms/
    └── tokens/
```

---

## Layer Contracts

### Domain Layer
- Contains: Entity types, repository interfaces, value objects, business rules
- Depends on: Nothing (pure TypeScript)
- Must NOT import: Supabase, React, Zustand, any external library

```ts
// src/features/quest/domain/Quest.ts
export type QuestStatus = 'pending' | 'completed' | 'skipped';

export interface Quest {
  quest_id: string;
  title: string;
  branch: Branch;
  difficulty: Difficulty;
  duration_min: number;
  xp_reward: number;
  completed_at: string | null;
  status: QuestStatus;
}

// src/features/quest/domain/QuestRepository.ts
export interface QuestRepository {
  getDailyQuests(userId: string): Promise<Quest[]>;
  completeQuest(questId: string, userId: string): Promise<void>;
  getQuestsForNode(nodeId: string): Promise<Quest[]>;
}
```

### Application Layer
- Contains: Use cases as custom hooks, orchestrates domain logic
- Depends on: Domain interfaces (via dependency injection), `store/`
- Must NOT import: Supabase directly, UI components

```ts
// src/features/quest/application/useCompleteQuest.ts
import type { QuestRepository } from '../domain/QuestRepository';
import { useQuestStore } from '@/src/store/questStore';
import { useUserStore } from '@/src/store/userStore';

export function useCompleteQuest(repo: QuestRepository) {
  const markComplete = useQuestStore((s) => s.markQuestComplete);
  const updateXP = useUserStore((s) => s.updateXP);

  return async (questId: string, xpReward: number) => {
    // Optimistic update first
    markComplete(questId);
    updateXP(xpReward);

    // Persist to server (fire-and-forget)
    try {
      await repo.completeQuest(questId, useUserStore.getState().user!.user_id);
    } catch (err) {
      if (__DEV__) console.warn('[useCompleteQuest] sync failed:', err);
      // Queue for offline retry
    }
  };
}
```

### Infrastructure Layer
- Contains: Supabase implementations of repository interfaces, data mappers, local storage adapters
- Depends on: Domain interfaces, Supabase client, AsyncStorage
- Must NOT import: UI components, React hooks (except for DI wiring)

```ts
// src/features/quest/infrastructure/SupabaseQuestRepository.ts
import { supabase } from '@/src/core/api/supabase';
import type { QuestRepository } from '../domain/QuestRepository';
import type { Quest } from '../domain/Quest';

export class SupabaseQuestRepository implements QuestRepository {
  async getDailyQuests(userId: string): Promise<Quest[]> {
    const { data, error } = await supabase
      .from('user_quests')
      .select('*, quests(*)')
      .eq('user_id', userId)
      .eq('assigned_date', new Date().toISOString().split('T')[0]);

    if (error) throw error;
    return data.map(mapToQuest);
  }

  async completeQuest(questId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_quests')
      .update({ completed_at: new Date().toISOString() })
      .eq('quest_id', questId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async getQuestsForNode(nodeId: string): Promise<Quest[]> {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .eq('node_id', nodeId);

    if (error) throw error;
    return data.map(mapToQuest);
  }
}
```

### Presentation Layer
- Contains: Screen components, feature-specific hooks that connect to application layer, local styles
- Depends on: Application hooks, UI design system
- Must NOT import: Supabase, repository implementations directly

```tsx
// src/features/quest/presentation/QuestsScreen.tsx
import { useQuestStore } from '@/src/store/questStore';
import { useCompleteQuest } from '../application/useCompleteQuest';
import { questRepository } from '../infrastructure'; // DI singleton
import { QuestItem } from '@/src/ui/molecules/QuestItemComponent';

export function QuestsScreen() {
  const dailyQuests = useQuestStore((s) => s.dailyQuests);
  const completeQuest = useCompleteQuest(questRepository);

  return (
    <FlatList
      data={dailyQuests}
      renderItem={({ item }) => (
        <QuestItem
          quest={item}
          onComplete={() => completeQuest(item.quest_id, item.xp_reward)}
        />
      )}
    />
  );
}
```

---

## File Migration Map

### `src/core/`

| Current Location | New Location |
|---|---|
| `src/business-logic/api/supabase.ts` | `src/core/api/supabase.ts` |
| `src/business-logic/api/query-client.ts` | `src/core/api/queryClient.ts` |
| `src/business-logic/api/client.ts` | `src/core/api/client.ts` |
| `src/business-logic/api/supabase/database.types.ts` | `src/core/api/database.types.ts` |
| `src/business-logic/types/index.ts` | `src/core/types/index.ts` |
| `src/business-logic/config/branch-config.ts` | `src/core/constants/branchConfig.ts` |

### `src/store/` (Global State)

| Current Location | New Location |
|---|---|
| `src/business-logic/stores/userStore.ts` | `src/store/userStore.ts` |
| `src/business-logic/stores/questStore.ts` | `src/store/questStore.ts` |
| `src/business-logic/stores/skillTreeStore.ts` | `src/store/skillTreeStore.ts` |
| `src/business-logic/stores/notificationStore.ts` | `src/store/notificationStore.ts` |
| `src/business-logic/stores/settingsStore.ts` | `src/store/settingsStore.ts` |
| `src/business-logic/stores/themeStore.ts` | `src/store/themeStore.ts` |
| `src/business-logic/stores/challengeStore.ts` | `src/store/challengeStore.ts` |
| `src/business-logic/stores/onboardingStore.ts` | `src/store/onboardingStore.ts` |
| `src/business-logic/stores/roadmapStore.ts` | `src/store/roadmapStore.ts` |
| `src/business-logic/stores/customSkillTreeStore.ts` | `src/store/customSkillTreeStore.ts` |

### `src/features/auth/`

| Current Location | New Location | Layer |
|---|---|---|
| (new) | `src/features/auth/domain/AuthUser.ts` | domain |
| (new) | `src/features/auth/domain/AuthRepository.ts` | domain |
| `src/business-logic/auth/useAuth.ts` | `src/features/auth/application/useAuth.ts` | application |
| `src/business-logic/auth/useSignIn.ts` | `src/features/auth/application/useSignIn.ts` | application |
| `src/business-logic/auth/useSignUp.ts` | `src/features/auth/application/useSignUp.ts` | application |
| `src/business-logic/auth/useSignOut.ts` | `src/features/auth/application/useSignOut.ts` | application |
| `src/business-logic/auth/useResetPassword.ts` | `src/features/auth/application/useResetPassword.ts` | application |
| `src/business-logic/api/services/userService.ts` (auth parts) | `src/features/auth/infrastructure/SupabaseAuthRepository.ts` | infrastructure |
| `app/(auth)/login.tsx` | `src/features/auth/presentation/LoginScreen.tsx` | presentation |
| `app/(auth)/register.tsx` | `src/features/auth/presentation/RegisterScreen.tsx` | presentation |
| `app/(auth)/welcome.tsx` | `src/features/auth/presentation/WelcomeScreen.tsx` | presentation |
| `app/(auth)/forgot-password.tsx` | `src/features/auth/presentation/ForgotPasswordScreen.tsx` | presentation |
| `app/(auth)/splash.tsx` | `src/features/auth/presentation/SplashScreen.tsx` | presentation |

### `src/features/quest/`

| Current Location | New Location | Layer |
|---|---|---|
| (new) | `src/features/quest/domain/Quest.ts` | domain |
| (new) | `src/features/quest/domain/QuestRepository.ts` | domain |
| `src/business-logic/data/quest-library.ts` | `src/features/quest/domain/questLibrary.ts` | domain |
| `src/business-logic/hooks/useQuestManager.ts` | `src/features/quest/application/useQuestManager.ts` | application |
| `src/hooks/useQuestsScreen.ts` | `src/features/quest/application/useQuestsScreen.ts` | application |
| `src/business-logic/api/services/questService.ts` | `src/features/quest/infrastructure/SupabaseQuestRepository.ts` | infrastructure |
| `src/ui/organisms/QuestPreviewSection.tsx` | `src/features/quest/presentation/QuestPreviewSection.tsx` | presentation |
| `src/ui/organisms/QuestList.tsx` | `src/features/quest/presentation/QuestList.tsx` | presentation |
| `app/(tabs)/quests.tsx` | `src/features/quest/presentation/QuestsScreen.tsx` | presentation |
| `app/quest/[id].tsx` | `src/features/quest/presentation/QuestDetailScreen.tsx` | presentation |

### `src/features/skill-tree/`

| Current Location | New Location | Layer |
|---|---|---|
| (new) | `src/features/skill-tree/domain/SkillNode.ts` | domain |
| (new) | `src/features/skill-tree/domain/SkillTreeRepository.ts` | domain |
| `src/business-logic/data/skill-tree-nodes.ts` | `src/features/skill-tree/domain/nodeDefinitions.ts` | domain |
| `src/business-logic/data/skill-tree-defaults.ts` | `src/features/skill-tree/domain/defaultTree.ts` | domain |
| `src/business-logic/data/skill-tree-generator.ts` | `src/features/skill-tree/application/generateSkillTree.ts` | application |
| `src/business-logic/utils/skill-tree-utils.ts` | `src/features/skill-tree/application/skillTreeUtils.ts` | application |
| `src/hooks/useTreeLayout.ts` | `src/features/skill-tree/application/useTreeLayout.ts` | application |
| `src/business-logic/hooks/useCustomTree.ts` | `src/features/skill-tree/application/useCustomTree.ts` | application |
| `src/business-logic/api/services/skillTreeService.ts` | `src/features/skill-tree/infrastructure/SupabaseSkillTreeRepository.ts` | infrastructure |
| `src/ui/organisms/SkillTreeCanvas.tsx` | `src/features/skill-tree/presentation/SkillTreeCanvas.tsx` | presentation |
| `src/ui/organisms/SkillTreeBranch.tsx` | `src/features/skill-tree/presentation/SkillTreeBranch.tsx` | presentation |
| `src/ui/organisms/SkillNodeSheet.tsx` | `src/features/skill-tree/presentation/SkillNodeSheet.tsx` | presentation |
| `app/(tabs)/tree.tsx` | `src/features/skill-tree/presentation/SkillTreeScreen.tsx` | presentation |
| `app/node-detail.tsx` | `src/features/skill-tree/presentation/NodeDetailScreen.tsx` | presentation |
| `app/branch/[id].tsx` | `src/features/skill-tree/presentation/BranchDetailScreen.tsx` | presentation |

### `src/features/user/`

| Current Location | New Location | Layer |
|---|---|---|
| (new) | `src/features/user/domain/UserProfile.ts` | domain |
| (new) | `src/features/user/domain/UserRepository.ts` | domain |
| `src/business-logic/hooks/useXPEngine.ts` | `src/features/user/application/useXPEngine.ts` | application |
| `src/business-logic/hooks/useStaminaSystem.ts` | `src/features/user/application/useStaminaSystem.ts` | application |
| `src/business-logic/hooks/useGrowthStreak.ts` | `src/features/user/application/useGrowthStreak.ts` | application |
| `src/business-logic/hooks/useHomeScreen.ts` | `src/features/user/application/useHomeScreen.ts` | application |
| `src/hooks/useProfileScreen.ts` | `src/features/user/application/useProfileScreen.ts` | application |
| `src/business-logic/api/services/userService.ts` | `src/features/user/infrastructure/SupabaseUserRepository.ts` | infrastructure |
| `src/ui/organisms/HomeHeader.tsx` | `src/features/user/presentation/HomeHeader.tsx` | presentation |
| `src/ui/organisms/SkillsSection.tsx` | `src/features/user/presentation/SkillsSection.tsx` | presentation |
| `app/(tabs)/index.tsx` | `src/features/user/presentation/HomeScreen.tsx` | presentation |
| `app/(tabs)/profile.tsx` | `src/features/user/presentation/ProfileScreen.tsx` | presentation |
| `app/settings.tsx` | `src/features/user/presentation/SettingsScreen.tsx` | presentation |

### `src/features/challenge/`

| Current Location | New Location | Layer |
|---|---|---|
| (new) | `src/features/challenge/domain/Challenge.ts` | domain |
| (new) | `src/features/challenge/domain/ChallengeRepository.ts` | domain |
| `src/business-logic/data/challenge-library.ts` | `src/features/challenge/domain/challengeLibrary.ts` | domain |
| `src/business-logic/hooks/useChallenges.ts` | `src/features/challenge/application/useChallenges.ts` | application |
| `src/business-logic/api/services/challengeService.ts` | `src/features/challenge/infrastructure/SupabaseChallengeRepository.ts` | infrastructure |
| `src/ui/molecules/ChallengeCard.tsx` | `src/features/challenge/presentation/ChallengeCard.tsx` | presentation |
| `app/leaderboard.tsx` | `src/features/challenge/presentation/LeaderboardScreen.tsx` | presentation |

### `src/features/onboarding/`

| Current Location | New Location | Layer |
|---|---|---|
| (new) | `src/features/onboarding/domain/OnboardingState.ts` | domain |
| `src/business-logic/data/assessment-questions.ts` | `src/features/onboarding/domain/assessmentQuestions.ts` | domain |
| `src/business-logic/hooks/useOnboarding.ts` | `src/features/onboarding/application/useOnboarding.ts` | application |
| `src/business-logic/hooks/useOnboardingFlow.ts` | `src/features/onboarding/application/useOnboardingFlow.ts` | application |
| `src/business-logic/api/services/onboardingService.ts` | `src/features/onboarding/infrastructure/SupabaseOnboardingRepository.ts` | infrastructure |
| `src/business-logic/api/services/assessmentService.ts` | `src/features/onboarding/infrastructure/SupabaseAssessmentRepository.ts` | infrastructure |
| `src/ui/organisms/OnboardingStep.tsx` | `src/features/onboarding/presentation/OnboardingStep.tsx` | presentation |
| `app/(auth)/assessment.tsx` | `src/features/onboarding/presentation/AssessmentScreen.tsx` | presentation |
| `app/(auth)/onboarding.tsx` | `src/features/onboarding/presentation/OnboardingScreen.tsx` | presentation |
| `app/(auth)/generating.tsx` | `src/features/onboarding/presentation/GeneratingScreen.tsx` | presentation |
| `app/(auth)/reveal.tsx` | `src/features/onboarding/presentation/RevealScreen.tsx` | presentation |

### `src/features/roadmap/`

| Current Location | New Location | Layer |
|---|---|---|
| (new) | `src/features/roadmap/domain/Roadmap.ts` | domain |
| `src/business-logic/hooks/useRoadmap.ts` | `src/features/roadmap/application/useRoadmap.ts` | application |
| `src/business-logic/api/services/roadmapService.ts` | `src/features/roadmap/infrastructure/SupabaseRoadmapRepository.ts` | infrastructure |
| `src/ui/organisms/RoadmapHorizonSection.tsx` | `src/features/roadmap/presentation/RoadmapHorizonSection.tsx` | presentation |
| `app/roadmap.tsx` | `src/features/roadmap/presentation/RoadmapScreen.tsx` | presentation |

---

## Dependency Rules (Strict)

```
domain       ←  application  ←  presentation
                    ↑
              infrastructure
```

1. **Domain** has zero dependencies on external code
2. **Application** depends on domain interfaces — never on infrastructure classes
3. **Infrastructure** implements domain interfaces — never imported by application directly
4. **Presentation** depends on application hooks only — never calls services or repositories directly
5. **Store** (`src/store/`) is global state, accessible from application and presentation layers
6. **Core** (`src/core/`) is accessible from all layers

Violations that must be eliminated:
- Direct `supabase.from(...)` calls inside hooks (e.g., `useQuestManager.ts`, `userStore.ts`)
- Service imports inside UI components
- Store imports inside service files

---

## Dependency Injection Pattern

Infrastructure instances are created once and injected as singletons:

```ts
// src/features/quest/infrastructure/index.ts
import { SupabaseQuestRepository } from './SupabaseQuestRepository';
export const questRepository = new SupabaseQuestRepository();

// src/features/quest/application/useQuestManager.ts
import { questRepository } from '../infrastructure';

export function useQuestManager() {
  const completeQuest = useCompleteQuest(questRepository);
  // ...
}
```

For testing, pass a mock repository:
```ts
const mockRepo: QuestRepository = {
  getDailyQuests: jest.fn().mockResolvedValue([]),
  completeQuest: jest.fn(),
  getQuestsForNode: jest.fn().mockResolvedValue([]),
};
const completeQuest = useCompleteQuest(mockRepo);
```

---

## Global State Design (`src/store/`)

Only truly global state lives here. Feature-local state lives inside `features/[feature]/application/`.

**Keep in global store:**
- `userStore` — authenticated user profile, XP, streak, stamina
- `questStore` — daily quests list (shared by home + quest screens)
- `settingsStore` — user preferences
- `themeStore` — color scheme
- `notificationStore` — in-app notification queue

**Move to feature-local state:**
- `onboardingStore` → `features/onboarding/application/useOnboardingState.ts`
- `roadmapStore` → `features/roadmap/application/useRoadmapState.ts`
- `customSkillTreeStore` → `features/skill-tree/application/useCustomTreeState.ts`
- `challengeStore` → `features/challenge/application/useChallengeState.ts`

---

## Migration Strategy

### Phase 1 — Core Infrastructure (no behavioral changes)
1. Create `src/core/` and move Supabase client, query client, database types, shared types
2. Create `src/store/` and move Zustand stores (pure file moves, update imports)
3. Add path aliases in `tsconfig.json` for new paths

### Phase 2 — Domain Interfaces
4. Create `domain/` folders with entity types and repository interfaces for each feature
5. These are new files — no existing code breaks

### Phase 3 — Infrastructure Layer
6. Create `SupabaseXxxRepository.ts` files wrapping existing service functions
7. Existing service files can be deprecated in place (they stay until Phase 5 cleans them)

### Phase 4 — Application Layer
8. Migrate hooks one feature at a time
9. Update imports to use domain interfaces, inject infrastructure via singleton pattern
10. Each hook migration is a PR — keep scope small

### Phase 5 — Presentation Layer
11. Move screen-level components into `features/[feature]/presentation/`
12. `app/` routes become thin wrappers that re-export presentation components (Expo Router requires files in `app/`)

### Phase 6 — Cleanup
13. Delete old `src/business-logic/` directories
14. Delete deprecated service files
15. Remove feature stores that moved to local state

---

## Path Alias Updates (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "paths": {
      "@/src/core/*": ["./src/core/*"],
      "@/src/features/*": ["./src/features/*"],
      "@/src/store/*": ["./src/store/*"],
      "@/src/ui/*": ["./src/ui/*"],
      "@/src/navigation/*": ["./src/navigation/*"]
    }
  }
}
```

---

## Dumb UI Rule

All UI components in `src/ui/` (atoms, molecules, organisms) must:
- Accept only props — no store imports, no service calls
- Be completely stateless (or use local UI-only state like `isExpanded`)
- Receive callbacks instead of executing side effects directly

Feature-specific "smart" components that connect to state live in `features/[feature]/presentation/`, not in `src/ui/`.

---

## Metrics for Done

- [ ] Zero `supabase.from()` calls outside `infrastructure/` directories
- [ ] Zero service imports inside `src/ui/` components
- [ ] Zero store imports inside `src/ui/` components
- [ ] Every repository has a TypeScript interface in its `domain/` folder
- [ ] Every application hook accepts its repository as a parameter (testable without mocking modules)
- [ ] `src/business-logic/` directory is empty and deleted
