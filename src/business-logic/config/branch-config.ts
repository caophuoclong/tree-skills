/**
 * Branch configuration types and static fallback data.
 *
 * The authoritative branch records live in the `branches` Supabase table
 * (migration 007). The constants below are used as:
 *   1. `placeholderData` in `useBranches()` so components never wait on a
 *      network request for this rarely-changing master data.
 *   2. A compile-time reference for TypeScript types.
 *
 * ⚠️  Do NOT add business logic here — use `useBranches()` in components.
 */

import type { Branch } from '../types';

export interface BranchMeta {
  /** Vietnamese display label */
  label: string;
  /** Short English name (used in progress strips, analytics) */
  labelEn: string;
  /** Hex accent color */
  color: string;
  /** Emoji icon */
  emoji: string;
  /** Ionicons icon name */
  icon: string;
}

export const BRANCH_META: Record<Branch, BranchMeta> = {
  career: {
    label: 'Sự nghiệp',
    labelEn: 'Tech & Career',
    color: '#7C6AF7',
    emoji: '💼',
    icon: 'briefcase',
  },
  finance: {
    label: 'Tài chính',
    labelEn: 'Finance & Money',
    color: '#22C55E',
    emoji: '💰',
    icon: 'wallet',
  },
  softskills: {
    label: 'Kỹ năng mềm',
    labelEn: 'Communication',
    color: '#F59E0B',
    emoji: '💬',
    icon: 'bulb',
  },
  wellbeing: {
    label: 'Sức khỏe',
    labelEn: 'Health & Mind',
    color: '#EC4899',
    emoji: '🧘',
    icon: 'leaf',
  },
};

/** Ordered array of all branches (for tab lists, pickers, etc.) */
export const BRANCHES: { id: Branch; label: string }[] = (
  Object.entries(BRANCH_META) as [Branch, BranchMeta][]
).map(([id, m]) => ({ id, label: m.label }));

/** Convenience: branch color map (used for chart/progress tinting) */
export const BRANCH_COLORS: Record<Branch, string> = Object.fromEntries(
  (Object.entries(BRANCH_META) as [Branch, BranchMeta][]).map(([id, m]) => [id, m.color]),
) as Record<Branch, string>;
