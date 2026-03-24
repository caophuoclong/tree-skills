import { create } from "zustand";
import type { LevelUpReward } from "../hooks/useXPEngine";
import { computeLevel } from "../hooks/useXPEngine";
import type {
  DailyStats,
  StreakShield,
  UserProgress,
  WeeklyDay,
} from "../types";

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
  /** ISO date of when daily bonus was actually claimed */
  dailyBonusClaimedDate: string | null;
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
    return {
      date: d.toISOString().split("T")[0],
      questsCompleted: 0,
      xpEarned: 0,
    };
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
  dailyBonusClaimedDate: null,
  streakShield: { activatedDate: null, shieldsRemaining: 2 },

  setUser: (user) => {
    set({ user, isAuthenticated: true, isAuthLoading: false });
  },

  setAuthLoading: (loading) => set({ isAuthLoading: loading }),

  setSessionReady: (ready) => {
    set({ sessionReady: ready });
  },

  loginBonusReward: null,

  updateXP: (amount) =>
    set((state) => {
      if (!state.user) return state;
      const newTotalXP = state.user.total_xp + amount;
      const { level, currentXP, xpToNext } = computeLevel(newTotalXP);
      return {
        user: {
          ...state.user,
          total_xp: newTotalXP,
          level,
          current_xp_in_level: currentXP,
          xp_to_next_level: xpToNext,
        },
      };
    }),

  updateStamina: (value) =>
    set((state) => {
      if (!state.user) return state;
      return {
        user: { ...state.user, stamina: Math.max(0, Math.min(100, value)) },
      };
    }),

  updateStreak: (streak) =>
    set((state) => {
      if (!state.user) return state;

      const bestStreak = Math.max(state.user.best_streak, streak);
      const today = new Date().toISOString().split("T")[0];

      console.log("[updateStreak]", { streak, bestStreak, today });

      // Persist to Supabase (fire-and-forget)
      import("../api/services/userService").then(({ userService }) => {
        userService
          .update({
            streak,
            best_streak: bestStreak,
            last_active_date: today,
          })
          .catch((err) => {
            if (__DEV__) console.warn("[updateStreak] Failed to persist:", err);
          });
      });

      // Record streak history
      import("../api/supabase").then(async ({ supabase }) => {
        const { error } = await (supabase as any).from("streak_history").upsert(
          {
            user_id: state.user!.user_id,
            date: today,
            streak_day: streak,
            quests_completed: state.dailyStats.quests_completed_today,
            xp_earned: 0,
          },
          { onConflict: "user_id,date" },
        );
        if (error && __DEV__)
          console.warn("[updateStreak] Failed to record history:", error);
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
      const isWellbeing = branch === "wellbeing";
      const isCareerFinance = branch === "career" || branch === "finance";
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
      const today = new Date().toISOString().split("T")[0];
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

  checkDailyLogin: () => {
    const state = useUserStore.getState();
    if (!state.user) {
      setTimeout(() => useUserStore.getState().checkDailyLogin(), 500);
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    // Already claimed today locally — skip
    if (state.dailyBonusClaimedDate === today) return;

    // Check DB first before showing modal
    import("../api/supabase").then(({ supabase }) => {
      (supabase as any)
        .from("daily_bonuses")
        .select("id")
        .eq("user_id", useUserStore.getState().user?.user_id)
        .eq("bonus_date", today)
        .maybeSingle()
        .then(({ data }: any) => {
          if (data) {
            // Already claimed in DB — mark locally, don't show modal
            useUserStore.setState({ dailyBonusClaimedDate: today });
            return;
          }
          // Not claimed — show bonus modal
          const currentUser = useUserStore.getState().user;
          if (!currentUser) return;
          const streak = currentUser.streak;
          const bonusXP = streak >= 7 ? 50 : streak >= 3 ? 30 : 20;
          useUserStore.setState({
            loginBonusReward: bonusXP,
            dailyStats: {
              ...useUserStore.getState().dailyStats,
              session_combo: 0,
            },
            user: { ...currentUser, last_login_at: today },
          });
        });
    });
  },

  activateStreakShield: () =>
    set((state) => {
      const today = new Date().toISOString().split("T")[0];
      return {
        streakShield: {
          activatedDate: today,
          shieldsRemaining: Math.max(
            0,
            state.streakShield.shieldsRemaining - 1,
          ),
        },
      };
    }),

  isStreakProtectedToday: (): boolean => {
    const state = useUserStore.getState();
    const today = new Date().toISOString().split("T")[0];
    return state.streakShield.activatedDate === today;
  },

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      sessionReady: false,
      dailyStats: DEFAULT_DAILY_STATS,
      weeklyActivity: getLast7Days(),
      levelUpReward: null,
      loginBonusReward: null,
      lastLoginDate: null,
      streakShield: { activatedDate: null, shieldsRemaining: 2 },
    }),
}));
