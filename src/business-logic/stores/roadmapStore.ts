import { create } from 'zustand';
import type { RoadmapMilestone, TimeHorizon, Branch } from '../types';

interface RoadmapStore {
  milestones: RoadmapMilestone[];
  setMilestones: (milestones: RoadmapMilestone[]) => void;
  addMilestone: (title: string, branch: Branch, horizon: TimeHorizon) => void;
  toggleMilestone: (id: string) => void;
  deleteMilestone: (id: string) => void;
}

// Helper to generate UUID
function generateId(): string {
  return Math.random().toString(36).slice(2);
}

// Helper to calculate target date based on horizon
function getTargetDate(horizon: TimeHorizon): string {
  const today = new Date();
  let daysToAdd = 0;

  switch (horizon) {
    case 'short':
      daysToAdd = 90; // 3 months
      break;
    case 'mid':
      daysToAdd = 365; // 1 year
      break;
    case 'long':
      daysToAdd = 1095; // 3 years
      break;
  }

  const targetDate = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return targetDate.toISOString().split('T')[0];
}


export const useRoadmapStore = create<RoadmapStore>((set) => ({
  milestones: [], // populated via useRoadmap → roadmapService.getAll()

  setMilestones: (milestones) => set({ milestones }),

  addMilestone: (title, branch, horizon) =>
    set((state) => ({
      milestones: [
        ...state.milestones,
        {
          id: generateId(),
          title,
          branch,
          horizon,
          targetDate: getTargetDate(horizon),
          isCompleted: false,
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  toggleMilestone: (id) =>
    set((state) => ({
      milestones: state.milestones.map((m) =>
        m.id === id ? { ...m, isCompleted: !m.isCompleted } : m
      ),
    })),

  deleteMilestone: (id) =>
    set((state) => ({
      milestones: state.milestones.filter((m) => m.id !== id),
    })),
}));
