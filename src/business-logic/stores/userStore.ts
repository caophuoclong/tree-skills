import { create } from 'zustand';
import type { UserProgress, DailyStats, WeeklyDay, StreakShield } from '../types';
import type { LevelUpReward } from '../hooks/useXPEngine';

interface UserStore {
  user: UserProgress | null;
  dailyStats: DailyStats;
  weeklyActivity: WeeklyDay[];
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  sessionReady: boolean;
  streakShield: StreakShield;
  setUser: (user: UserProgress) => void;
  setAuthLoading: (loading: boolean) => void;
  setSessionReady: (ready: boolean) => void;
  updateXP: (amount: number) => void;
  updateStamina: (value: number) => void;
  updateStreak: (streak: number) => void;
  incrementDailyQuestCount: (branch: string) => void;
  recordActivity: (xp: number) => void;
  resetDailyStats: () => void;
  levelUpReward: LevelUpReward | null;
  setLevelUpReward: (reward: LevelUpReward | null) => void;
  logout: () => void;
  loginBonusReward: number | null;
  setLoginBonusReward: (amount: number | null) => void;
  /** ISO date string (YYYY-MM-DD) of last bonus claim — independent of user object */
  lastLoginDate: string | null;
  checkDailyLogin: () => void;
  activateStreakShield: () => void;
  isStreakProtectedToday: () => boolean;
}

const DEFAULT_DAILY_STATS: DailyStats = {
  quests_completed_today: 0,
  wellbeing_quests_today: 0,
  career_finance_quests_today: 0,
  session_combo: 0,
};

function getLast7Days(): WeeklyDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { date: d.toISOString().split('T')[0], questsCompleted: 0, xpEarned: 0 };
  });
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  dailyStats: DEFAULT_DAILY_STATS,
  weeklyActivity: getLast7Days(),
  isAuthenticated: false,
  isAuthLoading: true,
  sessionReady: false,
  levelUpReward: null,
  lastLoginDate: null,
  streakShield: { activatedDate: null, shieldsRemaining: 2 },

  setUser: (user) => {
    console.log("[userStore] setUser called with:", user);
    set({ user, isAuthenticated: true, isAuthLoading: false });
    console.log("[userStore] After setUser, store state:", useUserStore.getState());
  },

  setAuthLoading: (loading) => set({ isAuthLoading: loading }),

  setSessionReady: (ready) => {
    console.log("[userStore] setSessionReady:", ready);
    set({ sessionReady: ready });
  },

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

      const bestStreak = Math.max(state.user.best_streak, streak);
      const today = new Date().toISOString().split('T')[0];

      // Persist to Supabase (fire-and-forget)
      import('../api/services/userService').then(({ userService }) => {
        userService.update({
          streak,
          best_streak: bestStreak,
          last_active_date: today,
        }).catch((err) => {
          if (__DEV__) console.warn('[updateStreak] Failed to persist:', err);
        });
      });

      return {
        user: {
          ...state.user,
          streak,
          best_streak: bestStreak,
          last_active_date: today,
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

  recordActivity: (xp) =>
    set((state) => {
      const today = new Date().toISOString().split('T')[0];
      const activity = [...state.weeklyActivity];
      const todayIdx = activity.findIndex((d) => d.date === today);
      if (todayIdx >= 0) {
        activity[todayIdx] = {
          ...activity[todayIdx],
          questsCompleted: activity[todayIdx].questsCompleted + 1,
          xpEarned: activity[todayIdx].xpEarned + xp,
        };
      }
      return { weeklyActivity: activity };
    }),

  checkDailyLogin: () =>
    set((state) => {
      // Only show bonus when authenticated
      if (!state.isAuthenticated || !state.user) return state;

      const today = new Date().toISOString().split('T')[0];

      // Already claimed today — skip
      if (state.lastLoginDate === today) return state;

      // Bonus XP scales with streak (more consecutive days = bigger reward)
      const streak = state.user?.streak ?? 0;
      const bonusXP =
        streak >= 7  ? 50 :
        streak >= 3  ? 30 :
                       20;

      return {
        lastLoginDate: today,
        loginBonusReward: bonusXP,
        dailyStats: { ...state.dailyStats, session_combo: 0 },
        // Mirror into user.last_login_at if user exists
        ...(state.user
          ? { user: { ...state.user, last_login_at: today } }
          : {}),
      };
    }),

  activateStreakShield: () =>
    set((state) => {
      const today = new Date().toISOString().split('T')[0];
      return {
        streakShield: {
          activatedDate: today,
          shieldsRemaining: Math.max(0, state.streakShield.shieldsRemaining - 1),
        },
      };
    }),

  isStreakProtectedToday: (): boolean => {
    const state = useUserStore.getState();
    const today = new Date().toISOString().split('T')[0];
    return state.streakShield.activatedDate === today;
  },

  logout: () => set({ user: null, isAuthenticated: false, sessionReady: false, dailyStats: DEFAULT_DAILY_STATS, weeklyActivity: getLast7Days(), levelUpReward: null, loginBonusReward: null, lastLoginDate: null, streakShield: { activatedDate: null, shieldsRemaining: 2 } }),
}));
