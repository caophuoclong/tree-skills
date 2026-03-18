# Supabase Setup

## Schema & Migrations

```
supabase/
└── migrations/
    ├── 20260318000001_initial_schema.sql   ← tables, triggers
    ├── 20260318000002_rls_policies.sql     ← Row Level Security
    └── 20260318000003_seed_catalog.sql     ← skill_nodes, challenges
```

### Run migrations

**Option A — Supabase CLI (recommended)**
```bash
# Install CLI
brew install supabase/tap/supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push

# Generate fresh TypeScript types
supabase gen types typescript --project-id YOUR_PROJECT_REF \
  > src/business-logic/api/supabase/database.types.ts
```

**Option B — SQL Editor (quick)**
Paste each migration file into Supabase Dashboard → SQL Editor → Run.

### Add a new migration

```bash
# Creates a timestamped file automatically
supabase migration new your_migration_name

# Edit the file, then push
supabase db push
```

## Environment Variables

Copy `.env.example` → `.env` and fill in:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Auth Configuration (Supabase Dashboard)

1. **Authentication → Providers → Email**: Enable Email/Password
2. **Authentication → URL Configuration**:
   - Site URL: `lifeskills://`
   - Redirect URLs: `lifeskills://reset-password`
3. **Authentication → Email Templates**: Customize if needed

## Auth Hooks Usage

```tsx
// In screens — just import and use
import { useSignIn, useSignUp, useSignOut, useAuth } from '@/src/business-logic/auth';

// useAuth is mounted in _layout.tsx — do NOT mount again in screens
// It handles session sync → userStore automatically

function LoginScreen() {
  const { signIn, isLoading, error } = useSignIn();
  // ...
}

function RegisterScreen() {
  const { signUp, isLoading, error, needsEmailConfirmation } = useSignUp();
  // ...
}

function ProfileScreen() {
  const { signOut } = useSignOut();
  // ...
}
```

## RLS Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | own | trigger only | own | cascade |
| `skill_nodes` | public | — | — | — |
| `quests` | public | — | — | — |
| `challenges` | public | — | — | — |
| `user_skill_nodes` | own | own | own | — |
| `user_quests` | own | own | — | — |
| `user_challenges` | own | own | own | own |
| `roadmap_milestones` | own | own | own | own |
| `custom_goal_trees` | own | own | own | own |
| `notifications` | own | service_role | own | own |
