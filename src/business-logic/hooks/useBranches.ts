import { useQuery } from "@tanstack/react-query";
import { branchService } from "../api/services/branchService";
import {
  BRANCH_META as BRANCH_META_FALLBACK,
  type BranchMeta,
} from "../config/branch-config";
import type { Branch } from "../types";

/**
 * Fetches branch master data from the database.
 *
 * `placeholderData` is pre-populated from the static fallback so
 * components never render in a loading state — DB data replaces it
 * transparently once fetched.
 */
export function useBranches() {
  const placeholderRows = (
    Object.entries(BRANCH_META_FALLBACK) as [Branch, BranchMeta][]
  ).map(([id, meta], i) => ({
    id,
    label: meta.label,
    label_en: meta.labelEn,
    color: meta.color,
    emoji: meta.emoji,
    icon: meta.icon,
    sort_order: i + 1,
  }));

  const { data = placeholderRows } = useQuery({
    queryKey: ["branches"],
    queryFn: branchService.getAll,
    staleTime: Infinity,
    placeholderData: placeholderRows,
  });

  const branchMeta: Record<Branch, BranchMeta> = Object.fromEntries(
    data.map((b) => [
      b.id,
      {
        label: b.label,
        labelEn: b.label_en,
        color: b.color,
        emoji: b.emoji,
        icon: b.icon,
      },
    ]),
  ) as Record<Branch, BranchMeta>;

  const branches = data.map((b) => ({ id: b.id as Branch, label: b.label }));

  return { branches, branchMeta };
}
