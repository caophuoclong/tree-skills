import type { Branch } from '../types';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  branch: Branch;
  targetCount: number;
  durationDays: number;
  endDate: string; // ISO string
}

export const CHALLENGE_LIBRARY: Challenge[] = [
  {
    id: 'ch-finance-fundamentals',
    title: 'Finance Fundamentals',
    description: 'Complete 5 finance quests to build your money management skills.',
    branch: 'finance',
    targetCount: 5,
    durationDays: 7,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ch-wellbeing-week',
    title: 'Wellbeing Week',
    description: 'Do 7 wellbeing quests in 7 days to restore your mental energy.',
    branch: 'wellbeing',
    targetCount: 7,
    durationDays: 7,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ch-career-sprint',
    title: 'Career Sprint',
    description: 'Power through 10 career quests in 14 days to accelerate your growth.',
    branch: 'career',
    targetCount: 10,
    durationDays: 14,
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
