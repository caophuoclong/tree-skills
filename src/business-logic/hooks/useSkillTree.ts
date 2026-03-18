import { useQuery } from '@tanstack/react-query';
import { skillTreeService } from '../api/services/skillTreeService';

export function useSkillTree() {
  const { data: nodes = [], isLoading } = useQuery({
    queryKey: ['skill-tree', 'nodes'],
    queryFn: () => skillTreeService.getNodes(),
    staleTime: 1000 * 60 * 10, // 10 min cache
  });

  return { nodes, isLoading };
}
