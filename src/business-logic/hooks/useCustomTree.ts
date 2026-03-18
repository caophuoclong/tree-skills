import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { API } from '../api/endpoints';
import { useCustomSkillTreeStore } from '../stores/customSkillTreeStore';
import type { CustomGoalTree } from '../types';

export function useCustomTree() {
  const { trees, initWithDemoData } = useCustomSkillTreeStore();

  const { data, isLoading } = useQuery({
    queryKey: ['custom-trees'],
    queryFn: async () => {
      const { data } = await apiClient.get<CustomGoalTree[]>(API.customTrees.list);
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  // Sync fetched trees → store (only if store is still empty)
  useEffect(() => {
    if (data && data.length > 0 && trees.length === 0) {
      initWithDemoData(); // uses fetched trees via the API
    }
  }, [data, trees.length, initWithDemoData]);

  return { trees: data ?? trees, isLoading };
}
