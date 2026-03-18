import { create } from 'zustand';
import type { RoadmapMilestone, TimeHorizon, Branch } from '../types';

interface RoadmapStore {
  milestones: RoadmapMilestone[];
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

// Seed data: 6 example milestones (2 per horizon, mixed branches)
const SEED_MILESTONES: RoadmapMilestone[] = [
  {
    id: generateId(),
    title: 'Hoàn thành khóa học Tiếng Anh A2',
    branch: 'softskills',
    horizon: 'short',
    targetDate: getTargetDate('short'),
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Tiết kiệm được $5000 quỹ khẩn cấp',
    branch: 'finance',
    horizon: 'short',
    targetDate: getTargetDate('short'),
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Nâng cấp lên vị trí cao hơn tại công ty',
    branch: 'career',
    horizon: 'mid',
    targetDate: getTargetDate('mid'),
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Đạt trọng lượng lý tưởng và sức khỏe tốt',
    branch: 'wellbeing',
    horizon: 'mid',
    targetDate: getTargetDate('mid'),
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Xây dựng sự nghiệp riêng độc lập',
    branch: 'career',
    horizon: 'long',
    targetDate: getTargetDate('long'),
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Tích lũy tài sản đạt tới 1 tỷ đồng',
    branch: 'finance',
    horizon: 'long',
    targetDate: getTargetDate('long'),
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
];

export const useRoadmapStore = create<RoadmapStore>((set) => ({
  milestones: SEED_MILESTONES,

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
