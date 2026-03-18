import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { skillTreeService } from '../api/services/skillTreeService';
import { useSkillTreeStore } from '../stores/skillTreeStore';

export function useSkillTree() {
  const { setNodes } = useSkillTreeStore();

  const { data: nodes = [], isLoading, isError } = useQuery({
    queryKey: ['skill-tree', 'nodes'],
    queryFn: () => skillTreeService.getNodes(),
    staleTime: 1000 * 60 * 10,
  });

  // Sync fetched nodes → Zustand store so all consumers stay in sync
  useEffect(() => {
    if (nodes.length > 0) {
      setNodes(nodes);
    }
  }, [nodes, setNodes]);

  return { nodes, isLoading, isError };
}
