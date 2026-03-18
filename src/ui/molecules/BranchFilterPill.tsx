import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '@/src/ui/tokens';
import type { Branch } from '@/src/business-logic/types';

const BRANCH_COLORS: Record<string, string> = {
  career: '#4DA8FF',
  finance: '#34D399',
  softskills: '#FBBF24',
  wellbeing: '#F472B6',
};

interface Props {
  branch: Branch | 'all';
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export function BranchFilterPill({ branch, label, isSelected, onPress }: Props) {
  const { colors } = useTheme();
  const branchColor =
    branch === 'all' ? colors.brandPrimary : BRANCH_COLORS[branch] ?? colors.brandPrimary;

  return (
    <View style={styles.wrapper}>
      {isSelected && <View style={[styles.shadow, { backgroundColor: colors.textPrimary }]} />}
      <TouchableOpacity
        style={[
          styles.pill,
          {
            backgroundColor: isSelected ? branchColor : 'transparent',
            borderColor: isSelected ? colors.textPrimary : colors.textMuted,
            borderWidth: isSelected ? 2 : 1.5,
          },
        ]}
        onPress={onPress}
      >
        <Text
          style={[
            styles.label,
            {
              color: isSelected ? '#fff' : colors.textSecondary,
              fontFamily: 'SpaceGrotesk-SemiBold',
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative', marginRight: 8 },
  shadow: { position: 'absolute', top: 2, left: 2, right: -2, bottom: -2, borderRadius: 20 },
  pill: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  label: { fontSize: 13 },
});
