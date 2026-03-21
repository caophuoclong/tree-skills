import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roadmapService } from '../api/services/roadmapService';
import { useRoadmapStore } from '../stores/roadmapStore';
import { useUserStore } from '../stores/userStore';
import type { Branch, TimeHorizon } from '../types';

export function useRoadmap() {
  const { setMilestones, toggleMilestone, deleteMilestone } = useRoadmapStore();
  const { isAuthenticated, sessionReady } = useUserStore();
  const queryClient = useQueryClient();

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['roadmap', 'milestones'],
    queryFn: () => roadmapService.getAll(),
    enabled: isAuthenticated && sessionReady,
    staleTime: 1000 * 60 * 5,
  });

  // Sync fetched milestones → Zustand store
  useEffect(() => {
    if (milestones.length > 0) {
      setMilestones(milestones);
    }
  }, [milestones, setMilestones]);

  const addMutation = useMutation({
    mutationFn: ({ title, branch, horizon }: { title: string; branch: Branch; horizon: TimeHorizon }) =>
      roadmapService.create(title, branch, horizon),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roadmap', 'milestones'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => {
      const m = milestones.find((x) => x.id === id);
      return roadmapService.update(id, { isCompleted: !m?.isCompleted });
    },
    onMutate: (id) => toggleMilestone(id), // optimistic update
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roadmap', 'milestones'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roadmapService.delete(id),
    onMutate: (id) => deleteMilestone(id), // optimistic update
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roadmap', 'milestones'] }),
  });

  return {
    milestones,
    isLoading,
    addMilestone: addMutation.mutate,
    toggleMilestone: toggleMutation.mutate,
    deleteMilestone: deleteMutation.mutate,
  };
}
