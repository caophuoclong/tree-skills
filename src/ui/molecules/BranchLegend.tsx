import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Branch } from '@/src/business-logic/types';
import { useTheme } from '@/src/ui/tokens';

interface BranchLegendProps {
  branches?: Array<{ id: Branch; label: string; color: string }>;
}

const DEFAULT_BRANCHES = [
  { id: 'career' as const, label: 'Career', color: '#4DA8FF' },
  { id: 'finance' as const, label: 'Finance', color: '#34D399' },
  { id: 'softskills' as const, label: 'Soft Skills', color: '#FBBF24' },
  { id: 'wellbeing' as const, label: 'Wellbeing', color: '#F472B6' },
];

export function BranchLegend({ branches = DEFAULT_BRANCHES }: BranchLegendProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {branches.map((branch) => (
        <View key={branch.id} style={styles.item}>
          <View style={[styles.colorDot, { backgroundColor: branch.color }]} />
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {branch.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexWrap: 'wrap',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk-Regular',
  },
});
