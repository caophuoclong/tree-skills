import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { challengeService } from '../api/services/challengeService';
import { useChallengeStore } from '../stores/challengeStore';

export function useChallenges() {
  const { setChallenges } = useChallengeStore();

  const { data: challenges = [], isLoading, isError } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => challengeService.getAll(),
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
