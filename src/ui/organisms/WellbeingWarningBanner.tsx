import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassView } from '@/src/ui/atoms/GlassView';
import { AppText } from '@/src/ui/atoms/Text';
import { useTheme } from '@/src/ui/tokens';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';

interface WellbeingWarningBannerProps {
  stamina: number;
  showHotline?: boolean;
}

export function WellbeingWarningBanner({ stamina, showHotline = false }: WellbeingWarningBannerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  if (stamina >= 30) return null;

  return (
    <GlassView style={styles.banner}>
      <View style={styles.content}>
        <AppText style={styles.icon}>{stamina === 0 ? '❤️' : '💙'}</AppText>
        <View style={styles.textContainer}>
          <AppText variant="caption" color={colors.textPrimary} style={styles.message}>
            {stamina === 0
              ? 'Bạn đang kiệt sức — hãy dừng lại và nghỉ ngơi nhé 💙'
              : 'Bạn đang grinding — hãy nghỉ một chút nhé 💙'}
          </AppText>
          {showHotline && (
            <AppText variant="micro" color={colors.textMuted} style={styles.hotline}>
              Nếu bạn cần hỗ trợ: Đường dây 1800 599 920 (miễn phí)
            </AppText>
          )}
          <AppText variant="micro" color={colors.textMuted} style={styles.disclaimer}>
            Ứng dụng này không thay thế tư vấn tâm lý chuyên nghiệp.
          </AppText>
        </View>
      </View>
      <TouchableOpacity onPress={() => router.push('/wellbeing')} style={styles.cta}>
        <AppText variant="micro" color={colors.wellbeing}>
          Xem Recovery Quests →
        </AppText>
      </TouchableOpacity>
    </GlassView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  banner: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderColor: `${colors.wellbeing}33`,
    marginHorizontal: Spacing.screenPadding,
    marginVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  content: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  icon: { fontSize: 20, marginTop: 2 },
  textContainer: { flex: 1, gap: 4 },
  message: { lineHeight: 18 },
  hotline: { marginTop: 2 },
  disclaimer: { marginTop: 2, fontStyle: 'italic' },
  cta: { alignSelf: 'flex-end' },
});
