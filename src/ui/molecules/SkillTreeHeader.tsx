import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Branch } from '@/src/business-logic/types';
import { useTheme } from '@/src/ui/tokens';
import { useUserStore } from '@/src/business-logic/stores/userStore';

interface Branch_Item {
  id: Branch;
  label: string;
}

interface SkillTreeHeaderProps {
  activeBranch: Branch;
  onBranchChange: (branch: Branch) => void;
  branches?: Branch_Item[];
  goalFilterActive?: boolean;
}

const DEFAULT_BRANCHES: Branch_Item[] = [
  { id: 'career', label: 'Sự nghiệp' },
  { id: 'finance', label: 'Tài chính' },
  { id: 'softskills', label: 'Kỹ năng mềm' },
  { id: 'wellbeing', label: 'Sức khỏe' },
];

const BRANCH_NAME: Record<Branch, string> = {
  career: 'Tech & Career',
  finance: 'Finance & Money',
  softskills: 'Communication',
  wellbeing: 'Health & Mind',
};

const BRANCH_COLORS: Record<Branch, string> = {
  career: '#4DA8FF',
  finance: '#34D399',
  softskills: '#FBBF24',
  wellbeing: '#F472B6',
};

export function SkillTreeHeader({
  activeBranch,
  onBranchChange,
  branches = DEFAULT_BRANCHES,
  goalFilterActive = false,
}: SkillTreeHeaderProps) {
  const { colors } = useTheme();
  const { dailyStats } = useUserStore();
  const wellbeingPulse = useRef(new Animated.Value(1)).current;

  const colorMap: Record<Branch, string> = {
    career: colors.career,
    finance: colors.finance,
    softskills: colors.softskills,
    wellbeing: colors.wellbeing,
  };

  // Trigger pulse animation when no wellbeing quests completed today
  useEffect(() => {
    if (dailyStats.wellbeing_quests_today === 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(wellbeingPulse, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(wellbeingPulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      wellbeingPulse.setValue(1);
    }
  }, [dailyStats.wellbeing_quests_today]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabsScroll}
      contentContainerStyle={styles.tabsRow}
    >
      {branches.map((b) => {
        const active = activeBranch === b.id;
        const col = colorMap[b.id];
        const isWellbeingWithNoDailyQuests =
          b.id === 'wellbeing' && dailyStats.wellbeing_quests_today === 0;

        return (
          <Animated.View
            key={`wellbeing-animated-${b.id}`}
            style={
              isWellbeingWithNoDailyQuests
                ? { opacity: wellbeingPulse }
                : undefined
            }
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onBranchChange(b.id)}
              style={[
                styles.tab,
                !goalFilterActive && active
                  ? {
                      backgroundColor: `${col}1E`,
                      borderColor: col,
                      borderWidth: 1.5,
                    }
                  : { borderColor: 'transparent', borderWidth: 1.5 },
                goalFilterActive && { opacity: 0.38 },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: goalFilterActive
                      ? col
                      : active
                        ? col
                        : colors.textMuted,
                  },
                  !goalFilterActive &&
                    active && {
                      fontFamily: 'SpaceGrotesk-Bold',
                      fontWeight: '700',
                    },
                ]}
              >
                {b.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* Separator */}
      <View
        style={[styles.tabSep, { backgroundColor: colors.glassBorder }]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabsScroll: { marginTop: 8, flexGrow: 0, flexShrink: 0, maxHeight: 38 },
  tabsRow: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  tabSep: { width: 1, height: 20, alignSelf: 'center', marginHorizontal: 4 },
  tabText: { fontSize: 13 },
});
