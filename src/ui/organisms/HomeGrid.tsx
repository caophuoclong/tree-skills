import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { BentoCard } from '@/src/ui/molecules/BentoCard';
import { StreakBadge } from '@/src/ui/molecules/StreakBadge';
import { StaminaBar } from '@/src/ui/molecules/StaminaBar';
import { XPProgressBar } from '@/src/ui/molecules/XPProgressBar';
import { MoodWidget } from '@/src/ui/molecules/MoodWidget';
import { AppText } from '@/src/ui/atoms/Text';
import { Icon } from '@/src/ui/atoms/Icon';
import { useTheme } from '@/src/ui/tokens';

import { Spacing } from '@/src/ui/tokens/spacing';
import type { Branch, MoodScore } from '@/src/business-logic/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL = (SCREEN_WIDTH - Spacing.screenPadding * 2 - Spacing.cardGap * 2) / 3;

interface SkillBranchProgress {
  branch: Branch;
  percent: number;
}

interface HomeGridProps {
  userName: string;
  level: number;
  currentXP: number;
  targetXP: number;
  streak: number;
  stamina: number;
  pendingQuestCount: number;
  branchProgress: SkillBranchProgress[];
  hasMoodToday: boolean;
  onMoodSelect?: (score: MoodScore) => void;
}

const getBranchColors = (colors: any): Record<string, string> => ({
  career: colors.career,
  finance: colors.finance,
  softskills: colors.softskills,
  wellbeing: colors.wellbeing,
});

export function HomeGrid({
  userName,
  level,
  currentXP,
  targetXP,
  streak,
  stamina,
  pendingQuestCount,
  branchProgress,
  hasMoodToday,
  onMoodSelect,
}: HomeGridProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const BranchColors = useMemo(() => getBranchColors(colors), [colors]);
  const router = useRouter();

  return (
    <View style={styles.grid}>
      {/* Row 1: Skill Tree Progress (2col) + Streak (1col) */}
      <View style={styles.row}>
        <BentoCard cols={2} onPress={() => router.push('/(tabs)/tree')} style={styles.treeCard}>
          <AppText variant="caption" color={colors.textMuted}>Skill Progress</AppText>
          <View style={styles.branchRings}>
            {branchProgress.map((bp) => (
              <View key={bp.branch} style={styles.branchItem}>
                <View style={[styles.ring, { borderColor: BranchColors[bp.branch as string] }]}>
                  <AppText variant="micro" color={BranchColors[bp.branch as string]}>
                    {bp.percent}%
                  </AppText>
                </View>
                <AppText variant="micro" color={colors.textMuted} style={styles.branchLabel}>
                  {bp.branch === 'softskills' ? 'Soft' : bp.branch.charAt(0).toUpperCase() + bp.branch.slice(1)}
                </AppText>
              </View>
            ))}
          </View>
        </BentoCard>

        <View style={styles.colGap} />

        <BentoCard cols={1} style={styles.streakCard}>
          <AppText variant="micro" color={colors.textMuted}>Streak</AppText>
          <StreakBadge count={streak} size="sm" />
        </BentoCard>
      </View>

      <View style={styles.rowGap} />

      {/* Row 1 cont: Stamina (1col, extends right) */}
      <View style={styles.rowRight}>
        <BentoCard cols={1} onPress={() => router.push('/wellbeing')} style={styles.staminaCard}>
          <StaminaBar value={stamina} />
        </BentoCard>
      </View>

      <View style={styles.rowGap} />

      {/* Row 2: Quests (1col) + XP Progress (2col) */}
      <View style={styles.row}>
        <BentoCard cols={1} onPress={() => router.push('/(tabs)/quests')} style={styles.questCard}>
          <Icon name="checkmark-circle" size="sm" color={colors.brandPrimary} />
          <AppText variant="title" color={colors.textPrimary} style={styles.questCount}>
            {pendingQuestCount}
          </AppText>
          <AppText variant="micro" color={colors.textMuted}>quests hôm nay</AppText>
        </BentoCard>

        <View style={styles.colGap} />

        <BentoCard cols={2} style={styles.xpCard}>
          <XPProgressBar current={currentXP} target={targetXP} level={level} />
        </BentoCard>
      </View>

      {/* Mood widget — show only if not checked in today */}
      {!hasMoodToday && (
        <>
          <View style={styles.rowGap} />
          <MoodWidget onSelect={onMoodSelect} />
        </>
      )}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  grid: {
    paddingHorizontal: Spacing.screenPadding,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rowRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingLeft: CELL + Spacing.cardGap, // Offset to align under streak card
  },
  rowGap: { height: Spacing.cardGap },
  colGap: { width: Spacing.cardGap },
  treeCard: { minHeight: 100 },
  streakCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  staminaCard: { width: CELL },
  questCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  xpCard: { justifyContent: 'center' },
  branchRings: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  branchItem: {
    alignItems: 'center',
    gap: 4,
  },
  ring: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchLabel: { textAlign: 'center' },
  questCount: { fontWeight: '700', fontSize: 28 },
});
