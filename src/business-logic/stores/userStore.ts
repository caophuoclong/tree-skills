import { create } from 'zustand';
import type { UserProgress, DailyStats } from '../types';
import type { LevelUpReward } from '../hooks/useXPEngine';

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
  levelUpReward: LevelUpReward | null;
  setLevelUpReward: (reward: LevelUpReward | null) => void;
  logout: () => void;
  loginBonusReward: number | null;
  setLoginBonusReward: (amount: number | null) => void;
  checkDailyLogin: () => void;
}

const DEFAULT_DAILY_STATS: DailyStats = {
  quests_completed_today: 0,
  wellbeing_quests_today: 0,
  career_finance_quests_today: 0,
  session_combo: 0,
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  dailyStats: DEFAULT_DAILY_STATS,
  isAuthenticated: false,
  levelUpReward: null,

  setUser: (user) => set({ user, isAuthenticated: true }),
  loginBonusReward: null,

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
      const newCombo = state.dailyStats.session_combo + 1;
      return {
        dailyStats: {
          quests_completed_today: state.dailyStats.quests_completed_today + 1,
          wellbeing_quests_today: isWellbeing
            ? state.dailyStats.wellbeing_quests_today + 1
            : state.dailyStats.wellbeing_quests_today,
          career_finance_quests_today: isCareerFinance
            ? state.dailyStats.career_finance_quests_today + 1
            : state.dailyStats.career_finance_quests_today,
          session_combo: newCombo,
        },
      };
    }),

  resetDailyStats: () => set({ dailyStats: DEFAULT_DAILY_STATS }),

  setLevelUpReward: (reward) => set({ levelUpReward: reward }),

  setLoginBonusReward: (amount) => set({ loginBonusReward: amount }),

  checkDailyLogin: () =>
    set((state) => {
      if (!state.user) return state;
      const today = new Date().toISOString().split('T')[0];
      const lastLogin = state.user.last_login_at?.split('T')[0];

      if (lastLogin !== today) {
        // Trigger bonus for first login of the day
        return {
          user: { ...state.user, last_login_at: today },
          loginBonusReward: 20, // Example: +20 XP on first login
          dailyStats: { ...state.dailyStats, session_combo: 0 },
        };
      }
      return state;
    }),

  logout: () => set({ user: null, isAuthenticated: false, dailyStats: DEFAULT_DAILY_STATS, levelUpReward: null, loginBonusReward: null }),
}));
