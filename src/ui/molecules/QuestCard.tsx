import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { GlassView } from '@/src/ui/atoms/GlassView';
import { AppText } from '@/src/ui/atoms/Text';
import { Badge } from '@/src/ui/atoms/Badge';
import { Checkbox } from '@/src/ui/atoms/Checkbox';
import { useTheme } from '@/src/ui/tokens';

import { Spacing, Radius } from '@/src/ui/tokens/spacing';
import type { Quest } from '@/src/business-logic/types';
import type { BranchColor } from '@/src/ui/tokens/colors';

interface QuestCardProps {
  quest: Quest;
  onComplete?: (questId: string) => void;
  onPress?: (questId: string) => void;
}

const getBranchColors = (colors: any): Record<string, string> => ({
  career: colors.career,
  finance: colors.finance,
  softskills: colors.softskills,
  wellbeing: colors.wellbeing,
});

export function QuestCard({ quest, onComplete, onPress }: QuestCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const BranchColors = useMemo(() => getBranchColors(colors), [colors]);
  const isCompleted = quest.completed_at !== null;
  const branchColor = BranchColors[quest.branch as string] ?? colors.brandPrimary;

  const opacity = useSharedValue(isCompleted ? 0.5 : 1);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const handleComplete = () => {
    if (isCompleted) return;
    opacity.value = withTiming(0.5, { duration: 300 });
    onComplete?.(quest.quest_id);
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity activeOpacity={0.85} onPress={() => onPress?.(quest.quest_id)}>
        <GlassView style={styles.card}>
          {/* Branch color left border */}
          <View style={[styles.leftBorder, { backgroundColor: branchColor }]} />

          <View style={styles.content}>
            {/* Top row: badges */}
            <View style={styles.topRow}>
              <View style={styles.tags}>
                <Badge variant="branch" value={quest.branch} branch={quest.branch as BranchColor} />
                <Badge variant="duration" value={quest.duration_min} style={styles.tagGap} />
              </View>
              <Badge variant="xp" value={quest.xp_reward} />
            </View>

            {/* Title */}
            <AppText
              variant="body"
              style={[styles.title, isCompleted && styles.completed]}
            >
              {quest.title}
            </AppText>
          </View>

          {/* Checkbox */}
          <View style={styles.checkboxContainer}>
            <Checkbox checked={isCompleted} onToggle={handleComplete} />
          </View>
        </GlassView>
      </TouchableOpacity>
    </Animated.View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  leftBorder: {
    width: 6,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tagGap: {
    marginLeft: Spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    marginTop: Spacing.xs,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  checkboxContainer: {
    paddingRight: Spacing.md,
  },
});
