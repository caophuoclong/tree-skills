import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/ui/tokens';
import { NeoBrutalAccent } from '@/src/ui/atoms';
import type { Branch, Difficulty } from '@/src/business-logic/types';

interface QuestMetaRowProps {
  duration: number;
  xpReward: number;
  difficulty: Difficulty;
  branch: Branch;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'DỄ DÀNG',
  medium: 'TRUNG BÌNH',
  hard: 'KHÓ',
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: '#10B981', // green
  medium: '#F59E0B', // amber
  hard: '#EF4444', // red
};

const getBranchColors = (colors: any): Record<Branch, string> => ({
  career: colors.career,
  finance: colors.finance,
  softskills: colors.softskills,
  wellbeing: colors.wellbeing,
});

export function QuestMetaRow({
  duration,
  xpReward,
  difficulty,
  branch,
}: QuestMetaRowProps) {
  const { colors } = useTheme();
  const BRANCH_COLORS = useMemo(() => getBranchColors(colors), [colors]);
  const difficultyColor = DIFFICULTY_COLORS[difficulty];

  return (
    <View style={styles.container}>
      {/* Duration pill */}
      <NeoBrutalAccent
        accentColor={colors.bgBase}
        strokeColor={colors.textMuted}
        borderWidth={1}
        shadowOffsetX={2}
        shadowOffsetY={2}
        borderRadius={8}
        contentStyle={styles.pill}
      >
        <Ionicons name="time-outline" size={12} color={colors.textMuted} />
        <Text style={[styles.pillText, { color: colors.textSecondary }]}>
          {duration} min
        </Text>
      </NeoBrutalAccent>

      {/* XP Reward pill */}
      <NeoBrutalAccent
        accentColor={colors.bgBase}
        strokeColor={BRANCH_COLORS[branch]}
        borderWidth={1}
        shadowOffsetX={2}
        shadowOffsetY={2}
        borderRadius={8}
        contentStyle={styles.pill}
      >
        <Ionicons name="flash" size={12} color={BRANCH_COLORS[branch]} />
        <Text style={[styles.pillText, { color: BRANCH_COLORS[branch] }]}>
          +{xpReward} XP
        </Text>
      </NeoBrutalAccent>

      {/* Difficulty pill */}
      <NeoBrutalAccent
        accentColor={colors.bgBase}
        strokeColor={difficultyColor}
        borderWidth={1}
        shadowOffsetX={2}
        shadowOffsetY={2}
        borderRadius={8}
        contentStyle={styles.pill}
      >
        <Text style={[styles.pillText, { color: difficultyColor, fontWeight: '700' }]}>
          {DIFFICULTY_LABELS[difficulty]}
        </Text>
      </NeoBrutalAccent>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontWeight: '600',
  },
});
