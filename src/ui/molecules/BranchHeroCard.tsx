/**
 * BranchHeroCard — Header section for branch detail screen
 *
 * Displays the branch icon, title, description, and optional progress ring.
 * Uses NB styling with branch-specific colors.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NeoBrutalBox } from '@/src/ui/atoms';
import { useTheme } from '@/src/ui/tokens';
import { Spacing } from '@/src/ui/tokens/spacing';

export interface BranchHeroCardProps {
  branchColor: string;
  title: string;
  icon: React.ReactNode;
  onBackPress: () => void;
}

export function BranchHeroCard({
  branchColor,
  title,
  icon,
  onBackPress,
}: BranchHeroCardProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.header}>
      <NeoBrutalBox
        borderColor={colors.glassBorder}
        backgroundColor={colors.bgElevated}
        shadowColor="#000"
        shadowOffsetX={2}
        shadowOffsetY={2}
        borderWidth={1.5}
        borderRadius={14}
        onPress={onBackPress}
        contentStyle={{
          width: 36,
          height: 36,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </NeoBrutalBox>

      <View style={styles.headerCenter}>
        <View style={[styles.branchDot, { backgroundColor: branchColor }]} />
        <Text
          style={[
            styles.headerTitle,
            { color: branchColor },
          ]}
        >
          {title}
        </Text>
      </View>

      {/* Spacer to balance the back button */}
      <View style={styles.backButtonPlaceholder} />
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.screenPadding,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.glassBorder,
    },
    headerCenter: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
    },
    branchDot: {
      width: 10,
      height: 10,
      borderRadius: 9999,
    },
    headerTitle: {
      fontSize: 16,
      fontFamily: 'SpaceGrotesk-Bold',
      fontWeight: '700',
    },
    backButtonPlaceholder: {
      width: 36,
    },
  });
