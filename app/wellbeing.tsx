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
import { Text } from 'react-native';

import { NeoBrutalBox, NeoBrutalAccent, NeoBrutalThemed } from '@/src/ui/atoms';
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
        <NeoBrutalBox
          borderColor={colors.glassBorder}
          backgroundColor={colors.bgElevated}
          shadowColor="#000"
          shadowOffsetX={2}
          shadowOffsetY={2}
          borderWidth={1.5}
          borderRadius={18}
          onPress={() => router.back()}
          contentStyle={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </NeoBrutalBox>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Sức khoẻ Tinh Thần
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <NeoBrutalBox
          borderColor="#7C6AF760"
          backgroundColor="rgba(124,106,247,0.12)"
          shadowColor="#7C6AF7"
          shadowOffsetX={5}
          shadowOffsetY={5}
          borderWidth={2}
          borderRadius={16}
          style={{ marginBottom: 0 }}
          contentStyle={{ padding: 24, alignItems: 'center', gap: 8 }}
        >
          <Text style={styles.heroEmoji}>💚</Text>
          <Text style={[styles.heroTitle, { color: colors.textPrimary, fontSize: 28, fontWeight: '800' }]}>
            Bạn không đơn độc
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary, fontSize: 14 }]}>
            Sức khoẻ tinh thần quan trọng như sức khoẻ thể chất
          </Text>
        </NeoBrutalBox>

        {/* Hotline Card */}
        <NeoBrutalBox
          borderColor={`${colors.success}60`}
          backgroundColor={colors.bgSurface}
          shadowColor={colors.success}
          shadowOffsetX={5}
          shadowOffsetY={5}
          borderWidth={2}
          borderRadius={16}
          contentStyle={{ padding: 20, gap: 16 }}
        >
          <View style={styles.hotlineTop}>
            <Text style={styles.hotlineEmoji}>📞</Text>
            <View style={styles.hotlineInfo}>
              <Text style={[styles.hotlineHeading, { color: colors.textPrimary, fontSize: 14, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700' }]}>
                Đường dây hỗ trợ tâm lý 24/7
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                Miễn phí · Bảo mật · Luôn sẵn sàng
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.phoneNumberWrap, pressed && styles.phoneNumberPressed]}
            onPress={handleCopyHotline}
          >
            <Text style={[styles.phoneNumber, { color: colors.success, fontSize: 28, fontWeight: '800' }]}>
              {HOTLINE}
            </Text>
            <View style={styles.copyHint}>
              <Ionicons name="copy-outline" size={14} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                Nhấn để sao chép
              </Text>
            </View>
          </Pressable>

          <NeoBrutalAccent
            accentColor={colors.success}
            strokeColor="rgba(0,0,0,0.5)"
            shadowOffsetX={3}
            shadowOffsetY={3}
            borderWidth={2}
            borderRadius={12}
            onPress={handleCallHotline}
            contentStyle={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 }}
          >
            <Ionicons name="call" size={16} color="#FFFFFF" />
            <Text style={[styles.callBtnText, { color: '#FFFFFF', fontSize: 14, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700' }]}>
              Gọi ngay
            </Text>
          </NeoBrutalAccent>
        </NeoBrutalBox>

        {/* Self-care Tips */}
        <View style={styles.section}>
          <Text style={{ fontSize: 18, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: colors.textPrimary }}>
            Chăm sóc bản thân
          </Text>
          <View style={styles.tipsGrid}>
            {SELF_CARE_TIPS.map((tip) => (
              <NeoBrutalBox
                key={tip.title}
                borderColor={colors.glassBorder}
                backgroundColor={colors.bgSurface}
                shadowColor="#000"
                shadowOffsetX={3}
                shadowOffsetY={3}
                borderWidth={1.5}
                borderRadius={12}
                style={{ width: '47%' }}
                contentStyle={{ padding: 14, gap: 6 }}
              >
                <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                <Text style={[styles.tipTitle, { color: colors.textPrimary, fontSize: 14, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700' }]}>
                  {tip.title}
                </Text>
                <Text style={[styles.tipDesc, { color: colors.textMuted, fontSize: 12 }]}>
                  {tip.description}
                </Text>
              </NeoBrutalBox>
            ))}
          </View>
        </View>

        {/* Crisis Resources */}
        <NeoBrutalBox
          borderColor={colors.danger + '40'}
          backgroundColor={colors.bgSurface}
          shadowColor={colors.danger}
          shadowOffsetX={4}
          shadowOffsetY={4}
          borderWidth={2}
          borderRadius={16}
          contentStyle={{ padding: 20, gap: 12 }}
        >
          <Text style={{ fontSize: 18, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: colors.textPrimary }}>
            Khi cần giúp đỡ khẩn cấp
          </Text>
          {CRISIS_RESOURCES.map((resource) => (
            <Pressable
              key={resource.label}
              style={({ pressed }) => [styles.crisisRow, pressed && styles.crisisRowPressed]}
              onPress={resource.number ? () => handleCallCrisis(resource.number!) : undefined}
            >
              <Text style={styles.crisisEmoji}>{resource.emoji}</Text>
              <View style={styles.crisisInfo}>
                <Text style={[styles.crisisLabel, { color: colors.textPrimary, fontFamily: 'SpaceGrotesk-SemiBold', fontWeight: '600', fontSize: 14 }]}>
                  {resource.label}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                  {resource.sublabel}
                </Text>
              </View>
              {resource.number && (
                <Ionicons name="call-outline" size={18} color={colors.success} />
              )}
            </Pressable>
          ))}
        </NeoBrutalBox>

        {/* Disclaimer */}
        <Text style={[styles.disclaimer, { color: colors.textMuted, fontSize: 12 }]}>
          Ứng dụng này không thay thế cho tư vấn chuyên nghiệp. Nếu bạn đang trong tình trạng khủng hoảng, hãy tìm kiếm sự giúp đỡ ngay lập tức.
        </Text>

        {/* Wellbeing Quests CTA */}
        <NeoBrutalAccent
          accentColor={colors.wellbeing}
          strokeColor="rgba(0,0,0,0.5)"
          shadowOffsetX={4}
          shadowOffsetY={4}
          borderWidth={2}
          borderRadius={12}
          onPress={() => router.push('/(tabs)/quests')}
          contentStyle={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 }}
        >
          <Ionicons name="leaf-outline" size={18} color="#FFFFFF" />
          <Text style={[styles.ctaBtnText, { color: '#FFFFFF', fontSize: 14, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700' }]}>
            Khám phá nhiệm vụ Sức khoẻ
          </Text>
        </NeoBrutalAccent>
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700',
    fontSize: 18,
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
  heroEmoji: { fontSize: 48, textAlign: 'center' },
  heroTitle: { textAlign: 'center' },
  heroSubtitle: { textAlign: 'center', lineHeight: 22 },

  // Hotline Card
  hotlineTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  hotlineEmoji: { fontSize: 28 },
  hotlineInfo: { flex: 1, gap: 2 },
  phoneNumberWrap: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
  },
  phoneNumberPressed: { opacity: 0.7 },
  copyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700' },

  // Self-care section
  section: { gap: Spacing.md },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tipEmoji: { fontSize: 28 },
  tipDesc: { lineHeight: 16 },

  // Crisis Resources
  crisisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  crisisRowPressed: { opacity: 0.6 },
  crisisEmoji: { fontSize: 24, width: 32, textAlign: 'center' },
  crisisInfo: { flex: 1, gap: 2 },

  // Disclaimer
  disclaimer: {
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },

  // CTA Button
  ctaBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700' },
});
