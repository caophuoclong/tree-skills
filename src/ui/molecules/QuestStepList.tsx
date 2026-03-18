import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/ui/tokens';
import { NeoBrutalBox } from '@/src/ui/atoms';

interface QuestStepListProps {
  steps: string[];
}

export function QuestStepList({ steps }: QuestStepListProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepRow}>
          <NeoBrutalBox
            borderColor={colors.brandPrimary}
            backgroundColor={colors.bgBase}
            shadowColor={colors.brandPrimary}
            shadowOffsetX={2}
            shadowOffsetY={2}
            borderWidth={1.5}
            borderRadius={12}
            contentStyle={styles.stepNumber}
          >
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          </NeoBrutalBox>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      gap: 12,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    stepNumber: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    stepNumberText: {
      fontSize: 12,
      fontFamily: 'SpaceGrotesk-Bold',
      fontWeight: '700',
      color: colors.brandPrimary,
    },
    stepText: {
      fontSize: 13,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: 20,
      paddingTop: 2,
    },
  });
