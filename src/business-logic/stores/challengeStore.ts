import { create } from 'zustand';
import { CHALLENGE_LIBRARY } from '../data/challenge-library';
import type { Challenge } from '../data/challenge-library';
import type { Branch } from '../types';

interface ChallengeStore {
  challenges: Challenge[];
  activeChallenges: string[]; // joined challenge IDs
  progress: Record<string, number>; // challengeId -> count
  setChallenges: (challenges: Challenge[]) => void;
  joinChallenge: (id: string) => void;
  leaveChallenge: (id: string) => void;
  recordQuestForChallenges: (branch: Branch) => void;
  getProgress: (id: string) => number;
  isCompleted: (id: string) => boolean;
  isExpired: (id: string) => boolean;
}

export const useChallengeStore = create<ChallengeStore>((set, get) => ({
  challenges: CHALLENGE_LIBRARY,
  activeChallenges: [],
  progress: {},

  setChallenges: (challenges) => set({ challenges }),

  joinChallenge: (id) =>
    set((s) => ({
      activeChallenges: s.activeChallenges.includes(id)
        ? s.activeChallenges
        : [...s.activeChallenges, id],
    })),

  leaveChallenge: (id) =>
    set((s) => ({
      activeChallenges: s.activeChallenges.filter((x) => x !== id),
    })),

  recordQuestForChallenges: (branch) =>
    set((s) => {
      const newProgress = { ...s.progress };
      s.challenges.forEach((ch) => {
        if (s.activeChallenges.includes(ch.id) && ch.branch === branch) {
          newProgress[ch.id] = (newProgress[ch.id] ?? 0) + 1;
        }
      });
      return { progress: newProgress };
    }),

  getProgress: (id) => get().progress[id] ?? 0,

  isCompleted: (id) => {
    const ch = get().challenges.find((c) => c.id === id);
    if (!ch) return false;
    return (get().progress[id] ?? 0) >= ch.targetCount;
  },

  isExpired: (id) => {
    const ch = get().challenges.find((c) => c.id === id);
    if (!ch) return false;
    return Date.now() > new Date(ch.endDate).getTime();
  },
}));
