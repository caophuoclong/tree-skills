import { useQuery } from '@tanstack/react-query';
import { challengeService } from '../api/services/challengeService';

export function useChallenges() {
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => challengeService.getAll(),
    staleTime: 1000 * 60 * 10, // 10 min cache
  });

  return { challenges, isLoading };
}
