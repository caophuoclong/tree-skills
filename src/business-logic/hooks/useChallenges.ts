import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { challengeService } from '../api/services/challengeService';
import { useChallengeStore } from '../stores/challengeStore';
import { useUserStore } from '../stores/userStore';

export function useChallenges() {
  const { setChallenges } = useChallengeStore();
  const { isAuthenticated, sessionReady } = useUserStore();

  const { data: challenges = [], isLoading, isError } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => challengeService.getAll(),
    enabled: isAuthenticated && sessionReady,
    staleTime: 1000 * 60 * 10,
  });

  // Sync fetched challenges → Zustand store
  useEffect(() => {
    if (challenges.length > 0) {
      setChallenges(challenges);
    }
  }, [challenges, setChallenges]);

  return { challenges, isLoading, isError };
}
