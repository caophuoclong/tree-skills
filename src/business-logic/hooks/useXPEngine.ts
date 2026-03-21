import { useCallback } from "react";
import { userService } from "../api/services/userService";
import { useUserStore } from "../stores/userStore";

// XP required per level — grows progressively
// TODO: Move it to a master_data table in Supabase with type is "xp_thresholds"
const XP_THRESHOLDS: Record<number, number> = {
  1: 100,
  2: 150,
  3: 200,
  4: 275,
  5: 350,
  6: 450,
  7: 575,
  8: 725,
  9: 900,
  10: 1100,
};

const MAX_LEVEL = 10;

export function getXPThreshold(level: number): number {
  return XP_THRESHOLDS[level] ?? XP_THRESHOLDS[MAX_LEVEL];
}

export function computeLevel(totalXP: number): {
  level: number;
  currentXP: number;
  xpToNext: number;
} {
  let level = 1;
  let remaining = totalXP;

  while (level < MAX_LEVEL) {
    const threshold = getXPThreshold(level);
    if (remaining < threshold) break;
    remaining -= threshold;
    level++;
  }

  const xpToNext = level >= MAX_LEVEL ? 0 : getXPThreshold(level) - remaining;

  return { level, currentXP: remaining, xpToNext };
}

export interface LevelUpReward {
  level: number;
  message: string;
  unlocks: string;
}

// TODO: Move level-up rewards to master_data table in Supabase with type "level_up_rewards"
function getLevelUpReward(level: number): LevelUpReward {
  const rewards: Record<number, LevelUpReward> = {
    2: {
      level: 2,
      message: "Good progress!",
      unlocks: "Unlocked harder quests",
    },
    3: {
      level: 3,
      message: "Skills improving!",
      unlocks: "Unlocked new skill branch",
    },
    4: {
      level: 4,
      message: "Standing out!",
      unlocks: "Unlocked detailed stats",
    },
    5: { level: 5, message: "Halfway there!", unlocks: "Unlocked leaderboard" },
    6: {
      level: 6,
      message: "Shining bright!",
      unlocks: "Unlocked community quests",
    },
    7: { level: 7, message: "Role model!", unlocks: "Unlocked mentor badges" },
    8: {
      level: 8,
      message: "Peak approaching!",
      unlocks: "Unlocked special titles",
    },
    9: {
      level: 9,
      message: "Almost expert!",
      unlocks: "Unlocked challenge mode",
    },
    10: { level: 10, message: "Peak reached!", unlocks: "Grandmaster title" },
  };
  return (
    rewards[level] ?? {
      level,
      message: `Level ${level}!`,
      unlocks: "Keep going!",
    }
  );
}

export function getComboMultiplier(combo: number): number {
  if (combo >= 5) return 2.0;
  if (combo >= 4) return 1.75;
  if (combo >= 3) return 1.5;
  return 1.0;
}

export interface XPEngineResult {
  addXP: (amount: number) => {
    reward: LevelUpReward | null;
    bonusXP: number;
    multiplier: number;
  };
  getXPThreshold: (level: number) => number;
  computeLevel: (totalXP: number) => {
    level: number;
    currentXP: number;
    xpToNext: number;
  };
}

export function useXPEngine(): XPEngineResult {
  const { user, setUser, setLevelUpReward } = useUserStore();

  const addXP = useCallback(
    (
      amount: number,
    ): {
      reward: LevelUpReward | null;
      bonusXP: number;
      multiplier: number;
    } => {
      if (!user) return { reward: null, bonusXP: 0, multiplier: 1 };

      const dailyStats = useUserStore.getState().dailyStats;
      const multiplier = getComboMultiplier(dailyStats.session_combo);
      const totalAmount = Math.round(amount * multiplier);
      const bonusXP = totalAmount - amount;

      const prevLevel = user.level;
      const newTotalXP = user.total_xp + totalAmount;
      const { level: newLevel, currentXP, xpToNext } = computeLevel(newTotalXP);

      // Update local store
      setUser({
        ...user,
        total_xp: newTotalXP,
        level: newLevel,
        current_xp_in_level: currentXP,
        xp_to_next_level: xpToNext,
      });

      // Persist to Supabase (fire-and-forget)
      userService
        .update({
          total_xp: newTotalXP,
          level: newLevel,
          current_xp_in_level: currentXP,
          xp_to_next_level: xpToNext,
        })
        .catch((err) => {
          if (__DEV__) console.warn("[useXPEngine] Failed to persist XP:", err);
        });

      let levelReward: LevelUpReward | null = null;
      if (newLevel > prevLevel) {
        levelReward = getLevelUpReward(newLevel);
        setLevelUpReward(levelReward);
      }

      return { reward: levelReward, bonusXP, multiplier };
    },
    [user, setUser, setLevelUpReward],
  );

  return { addXP, getXPThreshold, computeLevel };
}
