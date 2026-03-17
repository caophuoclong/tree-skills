import { create } from 'zustand';
import type { UserProgress, DailyStats } from '../types';

interface UserStore {
  user: UserProgress | null;
  dailyStats: DailyStats;
  isAuthenticated: boolean;
  setUser: (user: UserProgress) => void;
  updateXP: (amount: number) => void;
  updateStamina: (value: number) => void;
  updateStreak: (streak: number) => void;
  incrementDailyQuestCount: (branch: string) => void;
  resetDailyStats: () => void;
  logout: () => void;
}

const DEFAULT_DAILY_STATS: DailyStats = {
  quests_completed_today: 0,
  wellbeing_quests_today: 0,
  career_finance_quests_today: 0,
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  dailyStats: DEFAULT_DAILY_STATS,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  updateXP: (amount) =>
    set((state) => {
      if (!state.user) return state;
      const newXP = state.user.current_xp_in_level + amount;
      return {
        user: {
          ...state.user,
          total_xp: state.user.total_xp + amount,
          current_xp_in_level: newXP,
        },
      };
    }),

  updateStamina: (value) =>
    set((state) => {
      if (!state.user) return state;
      return { user: { ...state.user, stamina: Math.max(0, Math.min(100, value)) } };
    }),

  updateStreak: (streak) =>
    set((state) => {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          streak,
          best_streak: Math.max(state.user.best_streak, streak),
        },
      };
    }),

  incrementDailyQuestCount: (branch) =>
    set((state) => {
      const isWellbeing = branch === 'wellbeing';
      const isCareerFinance = branch === 'career' || branch === 'finance';
      return {
        dailyStats: {
          quests_completed_today: state.dailyStats.quests_completed_today + 1,
          wellbeing_quests_today: isWellbeing
            ? state.dailyStats.wellbeing_quests_today + 1
            : state.dailyStats.wellbeing_quests_today,
          career_finance_quests_today: isCareerFinance
            ? state.dailyStats.career_finance_quests_today + 1
            : state.dailyStats.career_finance_quests_today,
        },
      };
    }),

  resetDailyStats: () => set({ dailyStats: DEFAULT_DAILY_STATS }),

  logout: () => set({ user: null, isAuthenticated: false, dailyStats: DEFAULT_DAILY_STATS }),
}));
