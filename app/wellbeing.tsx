import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/src/ui/atoms/Text';
import { GlassView } from '@/src/ui/atoms/GlassView';
import { useTheme } from '@/src/ui/tokens';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';


const HOTLINE = '1800 599 920';

const SELF_CARE_TIPS = [
  { emoji: '😴', title: 'Giấc ngủ', description: 'Ngủ đủ 7-9 tiếng mỗi đêm' },
  { emoji: '🏃', title: 'Vận động', description: '30 phút tập thể dục mỗi ngày' },
  { emoji: '🧘', title: 'Thiền định', description: '10 phút mindfulness mỗi sáng' },
  { emoji: '🤝', title: 'Kết nối', description: 'Chia sẻ với người thân tin cậy' },
  { emoji: '📝', title: 'Nhật ký', description: 'Viết ra cảm xúc của bạn' },
  { emoji: '🌿', title: 'Thiên nhiên', description: 'Dành thời gian ngoài trời' },
];

const CRISIS_RESOURCES = [
  { emoji: '🚨', label: 'Gọi 115', sublabel: 'Cấp cứu y tế', number: '115' },
  { emoji: '🏥', label: 'Đến cơ sở y tế gần nhất', sublabel: 'Tìm bệnh viện / phòng khám', number: null },
];

export default function WellbeingScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const handleCopyHotline = () => {
    Alert.alert('Số điện thoại', HOTLINE, [{ text: 'Đóng' }]);
  };

  const handleCallHotline = () => {
    Linking.openURL(`tel:${HOTLINE.replace(/\s/g, '')}`);
  };

  const handleCallCrisis = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <AppText variant="title" color={colors.textPrimary} style={styles.headerTitle}>
          Sức khoẻ Tinh Thần
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <AppText style={styles.heroEmoji}>💚</AppText>
          <AppText variant="displayLG" color={colors.textPrimary} style={styles.heroTitle}>
            Bạn không đơn độc
          </AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.heroSubtitle}>
            Sức khoẻ tinh thần quan trọng như sức khoẻ thể chất
          </AppText>
        </View>

        {/* Hotline Card */}
        <GlassView style={styles.hotlineCard}>
          <View style={styles.hotlineTop}>
            <AppText style={styles.hotlineEmoji}>📞</AppText>
            <View style={styles.hotlineInfo}>
              <AppText variant="body" color={colors.textPrimary} style={styles.hotlineHeading}>
                Đường dây hỗ trợ tâm lý 24/7
              </AppText>
              <AppText variant="micro" color={colors.textMuted}>
                Miễn phí · Bảo mật · Luôn sẵn sàng
              </AppText>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.phoneNumberWrap, pressed && styles.phoneNumberPressed]}
            onPress={handleCopyHotline}
          >
            <AppText variant="displayLG" color={colors.success} style={styles.phoneNumber}>
              {HOTLINE}
            </AppText>
            <View style={styles.copyHint}>
              <Ionicons name="copy-outline" size={14} color={colors.textMuted} />
              <AppText variant="micro" color={colors.textMuted}>
                Nhấn để sao chép
              </AppText>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.callBtn, pressed && styles.callBtnPressed]}
            onPress={handleCallHotline}
          >
            <Ionicons name="call" size={16} color="#FFFFFF" />
            <AppText variant="body" color="#FFFFFF" style={styles.callBtnText}>
              Gọi ngay
            </AppText>
          </Pressable>
        </GlassView>

        {/* Self-care Tips */}
        <View style={styles.section}>
          <AppText variant="title" color={colors.textPrimary} style={styles.sectionTitle}>
            Chăm sóc bản thân
          </AppText>
          <View style={styles.tipsGrid}>
            {SELF_CARE_TIPS.map((tip) => (
              <GlassView key={tip.title} style={styles.tipCard}>
                <AppText style={styles.tipEmoji}>{tip.emoji}</AppText>
                <AppText variant="body" color={colors.textPrimary} style={styles.tipTitle}>
                  {tip.title}
                </AppText>
                <AppText variant="micro" color={colors.textMuted} style={styles.tipDesc}>
                  {tip.description}
                </AppText>
              </GlassView>
            ))}
          </View>
        </View>

        {/* Crisis Resources */}
        <GlassView style={styles.crisisCard}>
          <AppText variant="title" color={colors.textPrimary} style={styles.sectionTitle}>
            Khi cần giúp đỡ khẩn cấp
          </AppText>
          {CRISIS_RESOURCES.map((resource) => (
            <Pressable
              key={resource.label}
              style={({ pressed }) => [styles.crisisRow, pressed && styles.crisisRowPressed]}
              onPress={resource.number ? () => handleCallCrisis(resource.number!) : undefined}
            >
              <AppText style={styles.crisisEmoji}>{resource.emoji}</AppText>
              <View style={styles.crisisInfo}>
                <AppText variant="body" color={colors.textPrimary} style={styles.crisisLabel}>
                  {resource.label}
                </AppText>
                <AppText variant="micro" color={colors.textMuted}>
                  {resource.sublabel}
                </AppText>
              </View>
              {resource.number && (
                <Ionicons name="call-outline" size={18} color={colors.success} />
              )}
            </Pressable>
          ))}
        </GlassView>

        {/* Disclaimer */}
        <AppText variant="micro" color={colors.textMuted} style={styles.disclaimer}>
          Ứng dụng này không thay thế cho tư vấn chuyên nghiệp. Nếu bạn đang trong tình trạng khủng hoảng, hãy tìm kiếm sự giúp đỡ ngay lập tức.
        </AppText>

        {/* Wellbeing Quests CTA */}
        <Pressable
          style={({ pressed }) => [styles.ctaBtn, pressed && styles.ctaBtnPressed]}
          onPress={() => router.push('/(tabs)/quests')}
        >
          <Ionicons name="leaf-outline" size={18} color="#FFFFFF" />
          <AppText variant="body" color="#FFFFFF" style={styles.ctaBtnText}>
            Khám phá nhiệm vụ Sức khoẻ
          </AppText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPressed: {
    opacity: 0.6,
    backgroundColor: colors.glassBg,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },

  // Hero
  heroCard: {
    backgroundColor: 'rgba(124, 106, 247, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(124, 106, 247, 0.25)',
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroEmoji: { fontSize: 48, textAlign: 'center' },
  heroTitle: { fontWeight: '800', textAlign: 'center' },
  heroSubtitle: { textAlign: 'center', lineHeight: 22 },

  // Hotline Card
  hotlineCard: {
    padding: Spacing.lg,
    borderColor: `${colors.success}40`,
    borderWidth: 1.5,
    gap: Spacing.md,
  },
  hotlineTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  hotlineEmoji: { fontSize: 28 },
  hotlineInfo: { flex: 1, gap: 2 },
  hotlineHeading: { fontWeight: '700' },
  phoneNumberWrap: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
  },
  phoneNumberPressed: { opacity: 0.7 },
  phoneNumber: {
    fontWeight: '800',
    letterSpacing: 2,
  },
  copyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: colors.success,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
  },
  callBtnPressed: { opacity: 0.8 },
  callBtnText: { fontWeight: '700' },

  // Self-care section
  section: { gap: Spacing.md },
  sectionTitle: { fontWeight: '700' },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tipCard: {
    width: '47%',
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  tipEmoji: { fontSize: 28 },
  tipTitle: { fontWeight: '700' },
  tipDesc: { lineHeight: 16 },

  // Crisis Resources
  crisisCard: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  crisisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  crisisRowPressed: { opacity: 0.6 },
  crisisEmoji: { fontSize: 24, width: 32, textAlign: 'center' },
  crisisInfo: { flex: 1, gap: 2 },
  crisisLabel: { fontWeight: '600' },

  // Disclaimer
  disclaimer: {
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },

  // CTA Button
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: colors.wellbeing,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  ctaBtnPressed: { opacity: 0.8 },
  ctaBtnText: { fontWeight: '700' },
});
