import { router } from 'expo-router';
import { useRef, useMemo } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/src/ui/tokens';
import { NeoBrutalAccent, NeoBrutalBox, CompleteIcon } from '@/src/ui/atoms';
import type { Quest } from '@/src/business-logic/types';

const BRANCH_LABELS: Record<string, string> = {
  career: 'SỰ NGHIỆP',
  finance: 'TÀI CHÍNH',
  softskills: 'KỸ NĂNG MỀM',
  wellbeing: 'SỨC KHỎE',
};

const DIFFICULTY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  easy: { label: 'DỄ', bg: '#34D399', text: '#052E16' },
  medium: { label: 'TRUNG BÌNH', bg: '#FBBF24', text: '#1C1917' },
  hard: { label: 'KHÓ', bg: '#F472B6', text: '#1F0914' },
};

interface QuestItemProps {
  quest: Quest;
  onComplete: (id: string) => void;
}

export function QuestItem({ quest, onComplete }: QuestItemProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const branchColor = colors[quest.branch as keyof typeof colors] ?? colors.brandPrimary;
  const isCompleted = quest.completed_at !== null;
  const diff = DIFFICULTY_CONFIG[quest.difficulty] ?? DIFFICULTY_CONFIG.easy;
  const xpFlyY = useRef(new Animated.Value(0)).current;
  const xpFlyOpacity = useRef(new Animated.Value(0)).current;

  const triggerXPFlyUp = () => {
    xpFlyY.setValue(0);
    xpFlyOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(xpFlyY, {
        toValue: -48,
        duration: 900,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(xpFlyOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    onComplete(quest.quest_id);
  };

  return (
    <View style={{ position: 'relative' }}>
      <Animated.Text
        style={{
          position: 'absolute',
          top: 0,
          right: 16,
          fontSize: 16,
          fontWeight: '900',
          color: '#FBBF24',
          zIndex: 99,
          transform: [{ translateY: xpFlyY }],
          opacity: xpFlyOpacity,
          pointerEvents: 'none',
        }}
      >
        +{quest.xp_reward} XP ✦
      </Animated.Text>

      <NeoBrutalBox
        shadowOffsetX={4}
        shadowOffsetY={4}
        contentStyle={{ padding: 12 }}
        onPress={() => router.push(`/quest/${quest.quest_id}`)}
        style={{ opacity: isCompleted ? 0.55 : 1 }}
      >
        <View style={[styles.accentBar, { backgroundColor: branchColor, width: 5 }]} />

        <View style={styles.questCardTop}>
          <View style={styles.questCardTopLeft}>
            <NeoBrutalAccent
              accentColor={branchColor}
              strokeColor="#000"
              shadowOffsetX={2}
              shadowOffsetY={2}
              borderRadius={4}
              contentStyle={styles.branchChip}
            >
              <Text style={[styles.branchChipText, { color: '#0D0D0F' }]}>
                {BRANCH_LABELS[quest.branch] ?? quest.branch}
              </Text>
            </NeoBrutalAccent>
            <NeoBrutalAccent
              accentColor={diff.bg}
              strokeColor="#000"
              shadowOffsetX={2}
              shadowOffsetY={2}
              borderRadius={4}
              contentStyle={styles.diffBadge}
            >
              <Text style={[styles.diffBadgeText, { color: diff.text }]}>
                {diff.label}
              </Text>
            </NeoBrutalAccent>
          </View>

          {isCompleted ? (
            <CompleteIcon size={22} color={colors.finance} />
          ) : (
            <TouchableOpacity
              style={[styles.checkbox, { borderColor: branchColor, borderWidth: 2 }]}
              onPress={triggerXPFlyUp}
              hitSlop={8}
            />
          )}
        </View>

        <Text style={[styles.questTitle, isCompleted && styles.questTitleDone]}>
          {quest.title}
        </Text>

        <View style={styles.questCardBottom}>
          <NeoBrutalAccent
            accentColor="#FBBF24"
            strokeColor="#92400E"
            shadowOffsetX={2}
            shadowOffsetY={2}
            borderRadius={4}
            contentStyle={styles.xpBadge}
          >
            <Text style={styles.xpBadgeText}>+{quest.xp_reward} XP</Text>
          </NeoBrutalAccent>
          <Text style={styles.durationText}>⏱ {quest.duration_min} phút</Text>
        </View>
      </NeoBrutalBox>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    accentBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 5,
    },
    questCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    questCardTopLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexShrink: 1,
      flexWrap: 'wrap',
    },
    questCardBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    branchChip: {
      paddingHorizontal: 7,
      paddingVertical: 3,
    },
    branchChipText: {
      fontSize: 9,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    diffBadge: {
      paddingHorizontal: 7,
      paddingVertical: 3,
    },
    diffBadgeText: {
      fontSize: 9,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    durationText: {
      fontSize: 11,
      fontFamily: 'SpaceGrotesk-SemiBold',
      fontWeight: '600',
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 4,
    },
    questTitle: {
      fontSize: 16,
      fontFamily: 'SpaceGrotesk-Bold',
      fontWeight: '700',
      marginTop: 10,
      lineHeight: 22,
    },
    questTitleDone: {
      textDecorationLine: 'line-through',
      fontFamily: 'SpaceGrotesk-Medium',
      fontWeight: '500',
    },
    xpBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      alignSelf: 'flex-start',
    },
    xpBadgeText: {
      fontSize: 12,
      fontWeight: '900',
      color: '#1C1917',
      letterSpacing: 0.3,
    },
  });
