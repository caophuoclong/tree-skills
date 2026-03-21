import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useSkillTreeStore } from '@/src/business-logic/stores/skillTreeStore';
import { useUserStore } from '@/src/business-logic/stores/userStore';
import type { Branch } from '@/src/business-logic/types';
import { useTheme } from '@/src/ui/tokens';

export function useProfileScreen() {
  const { colors } = useTheme();
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const weeklyActivity = useUserStore((s) => s.weeklyActivity);
  const nodes = useSkillTreeStore((s) => s.nodes);
  const premiumShimmer = useRef(new Animated.Value(-1)).current;

  const name = user?.name ?? null;
  const level = user?.level ?? null;
  const currentXP = user?.current_xp_in_level ?? null;
  const streak = user?.streak ?? null;
  const bestStreak = user?.best_streak ?? null;

  const getBranchPercent = (branch: Branch): number => {
    const bn = nodes.filter((n) => n.branch === branch);
    if (bn.length === 0) return 0;
    return Math.round((bn.filter((n) => n.status === 'completed').length / bn.length) * 100);
  };

  const careerPct = getBranchPercent('career');
  const financePct = getBranchPercent('finance');
  const softPct = getBranchPercent('softskills');
  const wellPct = getBranchPercent('wellbeing');

  const streakValue = streak ?? 0;

  const milestones = useMemo(
    () => [
      {
        id: 1,
        title: 'Tân binh',
        description: 'Đạt 3 ngày liên tiếp',
        icon: 'medal-outline',
        unlocked: streakValue >= 3,
        color: colors.career,
      },
      {
        id: 2,
        title: 'Kiên trì',
        description: 'Đạt 7 ngày liên tiếp',
        icon: 'ribbon-outline',
        unlocked: streakValue >= 7,
        color: colors.finance,
      },
      {
        id: 3,
        title: 'Kỷ luật',
        description: 'Đạt 14 ngày liên tiếp',
        icon: 'shield-checkmark-outline',
        unlocked: streakValue >= 14,
        color: colors.softskills,
      },
      {
        id: 4,
        title: 'Huyền thoại',
        description: 'Đạt 30 ngày liên tiếp',
        icon: 'star-outline',
        unlocked: streakValue >= 30,
        color: colors.wellbeing,
      },
      {
        id: 5,
        title: 'Bậc thầy Sự nghiệp',
        description: 'Hoàn thành nhánh Sự nghiệp',
        icon: 'briefcase',
        unlocked: careerPct >= 100,
        color: colors.career,
      },
      {
        id: 6,
        title: 'Bậc thầy Tài chính',
        description: 'Hoàn thành nhánh Tài chính',
        icon: 'wallet',
        unlocked: financePct >= 100,
        color: colors.finance,
      },
      {
        id: 7,
        title: 'Bậc thầy Kỹ năng',
        description: 'Hoàn thành nhánh Kỹ năng mềm',
        icon: 'people',
        unlocked: softPct >= 100,
        color: colors.softskills,
      },
      {
        id: 8,
        title: 'Bậc thầy Sức khỏe',
        description: 'Hoàn thành nhánh Sức khỏe',
        icon: 'pulse',
        unlocked: wellPct >= 100,
        color: colors.wellbeing,
      },
    ],
    [streakValue, careerPct, financePct, softPct, wellPct, colors],
  );

  // Count completed branches
  const branchesCompleted = [careerPct, financePct, softPct, wellPct].filter(p => p >= 100).length;

  const stats = useMemo(
    () => [
      { value: null, label: 'QUESTS\nDONE' },
      { value: null, label: 'ACTIVE\nDAYS' },
      { value: bestStreak, label: 'BEST\nSTREAK' },
      { value: branchesCompleted > 0 ? `${branchesCompleted}/4` : null, label: 'BRANCHES\nDONE' },
    ],
    [bestStreak, branchesCompleted],
  );

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(premiumShimmer, {
        toValue: 2,
        duration: 2300,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();

    return () => loop.stop();
  }, [premiumShimmer]);

  const premiumShimmerTranslateX = premiumShimmer.interpolate({
    inputRange: [-1, 2],
    outputRange: [-140, 260],
  });

  return {
    name,
    level,
    currentXP,
    streak,
    bestStreak,
    weeklyActivity,
    careerPct,
    financePct,
    softPct,
    wellPct,
    milestones,
    stats,
    logout,
    premiumShimmer: premiumShimmerTranslateX,
  };
}
