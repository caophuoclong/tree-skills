import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect } from "react";
import { branchService } from "../api/services/branchService";
import { challengeService } from "../api/services/challengeService";
import { questService } from "../api/services/questService";
import { skillTreeService } from "../api/services/skillTreeService";
import { useChallengeStore } from "../stores/challengeStore";
import { useQuestStore } from "../stores/questStore";
import { useSkillTreeStore } from "../stores/skillTreeStore";
import { useUserStore } from "../stores/userStore";

function isAuthError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes("Not authenticated");
}

function handleAuthError() {
  console.warn("[useAppData] Auth error detected — redirecting to login");
  const { logout } = useUserStore.getState();
  logout();
  try {
    router.replace("/(auth)/welcome");
  } catch {
    // Router might not be ready yet
  }
}

/**
 * Centralized data fetcher — call once at app root after authentication.
 * Flow: Supabase → Zustand stores → UI components
 */
export function useAppData() {
  const { user, isAuthenticated, isAuthLoading, sessionReady } = useUserStore();
  const { setNodes } = useSkillTreeStore();
  const { setDailyQuests } = useQuestStore();
  const { setChallenges } = useChallengeStore();

  const primaryBranch = user?.primary_branch ?? "career";
  const stamina = user?.stamina ?? 100;

  // Only enable queries when auth is complete AND session is ready
  const canFetchData = sessionReady && isAuthenticated && !isAuthLoading;

  // Fetch skill tree nodes
  const skillTreeQuery = useQuery({
    queryKey: ["skill-tree", "nodes"],
    queryFn: () => skillTreeService.getNodes(),
    enabled: canFetchData,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  // Fetch daily quests
  const questsQuery = useQuery({
    queryKey: ["quests", "daily", primaryBranch, stamina],
    queryFn: () => questService.getDaily(primaryBranch, stamina),
    enabled: canFetchData,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  // Fetch challenges
  const challengesQuery = useQuery({
    queryKey: ["challenges"],
    queryFn: () => challengeService.getAll(),
    enabled: canFetchData,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  // Fetch branches (no auth required)
  const branchesQuery = useQuery({
    queryKey: ["branches"],
    queryFn: () => branchService.getAll(),
    staleTime: Infinity,
    retry: false,
  });

  // Handle auth errors — redirect to login
  useEffect(() => {
    if (skillTreeQuery.isError && isAuthError(skillTreeQuery.error))
      handleAuthError();
    if (questsQuery.isError && isAuthError(questsQuery.error))
      handleAuthError();
    if (challengesQuery.isError && isAuthError(challengesQuery.error))
      handleAuthError();
  }, [
    skillTreeQuery.isError,
    skillTreeQuery.error,
    questsQuery.isError,
    questsQuery.error,
    challengesQuery.isError,
    challengesQuery.error,
  ]);

  // Log errors
  if (skillTreeQuery.isError)
    console.error("[useAppData] skillTree error:", skillTreeQuery.error);
  if (questsQuery.isError)
    console.error("[useAppData] quests error:", questsQuery.error);
  if (challengesQuery.isError)
    console.error("[useAppData] challenges error:", challengesQuery.error);
  if (branchesQuery.isError)
    console.error("[useAppData] branches error:", branchesQuery.error);

  // Sync skill tree nodes → Zustand store
  useEffect(() => {
    const nodes = skillTreeQuery.data;
    if (nodes && nodes.length > 0) {
      console.log("[useAppData] Syncing skill nodes to store:", nodes.length);
      setNodes(nodes);
    }
  }, [skillTreeQuery.data, setNodes]);

  // Sync quests → Zustand store
  useEffect(() => {
    const quests = questsQuery.data;
    if (quests && quests.length > 0) {
      console.log("[useAppData] Syncing quests to store:", quests.length);
      setDailyQuests(quests);
    }
  }, [questsQuery.data, setDailyQuests]);

  // Sync challenges → Zustand store
  useEffect(() => {
    const challenges = challengesQuery.data;
    if (challenges && challenges.length > 0) {
      setChallenges(challenges);
    }
  }, [challengesQuery.data, setChallenges]);

  return {
    isLoading:
      skillTreeQuery.isLoading ||
      questsQuery.isLoading ||
      challengesQuery.isLoading ||
      branchesQuery.isLoading,
    isError:
      skillTreeQuery.isError ||
      questsQuery.isError ||
      challengesQuery.isError ||
      branchesQuery.isError,
  };
}
