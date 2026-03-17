import { useCallback } from 'react';
import { useUserStore } from '../stores/userStore';

// XP required per level — grows progressively
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
const MAX_LEVEL_XP = 9999;

export function getXPThreshold(level: number): number {
  return XP_THRESHOLDS[level] ?? MAX_LEVEL_XP;
}

export function computeLevel(totalXP: number): { level: number; currentXP: number; xpToNext: number } {
  let level = 1;
  let remaining = totalXP;

  while (level < MAX_LEVEL) {
    const threshold = getXPThreshold(level);
    if (remaining < threshold) break;
    remaining -= threshold;
    level++;
  }

  const xpToNext = level >= MAX_LEVEL ? MAX_LEVEL_XP : getXPThreshold(level) - remaining;

  return { level, currentXP: remaining, xpToNext };
}

export interface LevelUpReward {
  level: number;
  message: string;
  unlocks: string;
}

function getLevelUpReward(level: number): LevelUpReward {
  const rewards: Record<number, LevelUpReward> = {
    2: { level: 2, message: 'Bạn đang tiến bộ!', unlocks: 'Mở khóa nhiệm vụ khó hơn' },
    3: { level: 3, message: 'Kỹ năng của bạn đang được rèn giũa!', unlocks: 'Mở khóa nhánh kỹ năng mới' },
    4: { level: 4, message: 'Bạn đang nổi bật!', unlocks: 'Mở khóa thống kê chi tiết' },
    5: { level: 5, message: 'Nửa chặng đường rồi!', unlocks: 'Mở khóa bảng xếp hạng' },
    6: { level: 6, message: 'Kỹ năng của bạn đang phát sáng!', unlocks: 'Mở khóa nhiệm vụ cộng đồng' },
    7: { level: 7, message: 'Bạn là tấm gương cho người khác!', unlocks: 'Mở khóa mentor badges' },
    8: { level: 8, message: 'Đỉnh cao đang gần kề!', unlocks: 'Mở khóa danh hiệu đặc biệt' },
    9: { level: 9, message: 'Bạn gần như là chuyên gia!', unlocks: 'Mở khóa chế độ thử thách' },
    10: { level: 10, message: 'Bạn đã đạt đỉnh cao!', unlocks: 'Danh hiệu Grandmaster' },
  };
  return rewards[level] ?? { level, message: `Lên level ${level}!`, unlocks: 'Tiếp tục phát triển' };
}

export function getComboMultiplier(combo: number): number {
  if (combo >= 5) return 2.0;
  if (combo >= 4) return 1.75;
  if (combo >= 3) return 1.5;
  return 1.0;
}

export interface XPEngineResult {
  addXP: (amount: number) => { reward: LevelUpReward | null; bonusXP: number; multiplier: number };
  getXPThreshold: (level: number) => number;
  computeLevel: (totalXP: number) => { level: number; currentXP: number; xpToNext: number };
}

export function useXPEngine(): XPEngineResult {
  const { user, setUser, setLevelUpReward } = useUserStore();

  const addXP = useCallback(
    (amount: number): { reward: LevelUpReward | null; bonusXP: number; multiplier: number } => {
      if (!user) return { reward: null, bonusXP: 0, multiplier: 1 };

      const dailyStats = useUserStore.getState().dailyStats;
      const multiplier = getComboMultiplier(dailyStats.session_combo);
      const totalAmount = Math.round(amount * multiplier);
      const bonusXP = totalAmount - amount;

      const prevLevel = user.level;
      const newTotalXP = user.total_xp + totalAmount;
      const { level: newLevel, currentXP, xpToNext } = computeLevel(newTotalXP);

      setUser({
        ...user,
        total_xp: newTotalXP,
        level: newLevel,
        current_xp_in_level: currentXP,
        xp_to_next_level: xpToNext,
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
