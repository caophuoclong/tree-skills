import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GlassView } from '@/src/ui/atoms/GlassView';
import { AppText } from '@/src/ui/atoms/Text';
import { useTheme } from '@/src/ui/tokens';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';

interface WellbeingWarningBannerProps {
  onDismiss: () => void;
  onCTA: () => void;
  showHotline?: boolean;
}

export function WellbeingWarningBanner({ onDismiss, onCTA, showHotline = false }: WellbeingWarningBannerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <GlassView style={styles.banner}>
      <View style={styles.content}>
        <AppText style={styles.icon}>💙</AppText>
        <View style={styles.textContainer}>
          <AppText variant="caption" color={colors.textPrimary} style={styles.message}>
            Bạn đã hoàn thành 3+ nhiệm vụ hôm nay — hãy chú ý đến sức khỏe của bạn 💙
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
      <View style={styles.actions}>
        <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
          <AppText variant="micro" color={colors.textMuted}>
            Bỏ qua
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCTA} style={styles.cta}>
          <AppText variant="micro" color={colors.wellbeing}>
            Xem Recovery Quests →
          </AppText>
        </TouchableOpacity>
      </View>
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dismissBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  cta: { paddingHorizontal: Spacing.sm, paddingVertical: 4 },
});
