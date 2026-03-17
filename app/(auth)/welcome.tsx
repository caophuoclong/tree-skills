import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppText } from '@/src/ui/atoms/Text';
import { Button } from '@/src/ui/atoms/Button';
import { GlassView } from '@/src/ui/atoms/GlassView';
import { Colors } from '@/src/ui/tokens/colors';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';

const FEATURE_CARDS = [
  {
    icon: '💼',
    title: 'Sự nghiệp',
    description: 'Phát triển kỹ năng chuyên môn và thăng tiến trong công việc',
    color: Colors.career,
  },
  {
    icon: '💰',
    title: 'Tài chính',
    description: 'Quản lý chi tiêu thông minh và xây dựng tự do tài chính',
    color: Colors.finance,
  },
  {
    icon: '🤝',
    title: 'Kỹ năng mềm',
    description: 'Giao tiếp hiệu quả và xây dựng mối quan hệ bền chặt',
    color: Colors.softskills,
  },
];

function FeatureCard({
  icon,
  title,
  description,
  color,
  delay,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  const translateY = useSharedValue(60);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withSpring(0, { stiffness: 120, damping: 18 }),
    );
    opacity.value = withDelay(delay, withSpring(1, { stiffness: 120, damping: 18 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animStyle}>
      <GlassView style={StyleSheet.flatten([styles.featureCard, { borderLeftColor: color, borderLeftWidth: 3 }])}>
        <View style={styles.featureCardInner}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            <AppText style={styles.featureIcon}>{icon}</AppText>
          </View>
          <View style={styles.featureText}>
            <AppText variant="title" color={Colors.textPrimary} style={styles.featureTitle}>
              {title}
            </AppText>
            <AppText variant="body" color={Colors.textSecondary}>
              {description}
            </AppText>
          </View>
        </View>
      </GlassView>
    </Animated.View>
  );
}

export default function WelcomeScreen() {
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);

  useEffect(() => {
    headerOpacity.value = withSpring(1, { stiffness: 100, damping: 18 });
    headerTranslateY.value = withSpring(0, { stiffness: 100, damping: 18 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, headerStyle]}>
          <AppText style={styles.heroEmoji}>🌳</AppText>
          <AppText variant="displayXL" style={styles.title}>
            Xây dựng phiên bản{'\n'}tốt nhất của bạn
          </AppText>
          <AppText variant="bodyLG" color={Colors.textSecondary} style={styles.subtitle}>
            Gamify cuộc sống của bạn. Hoàn thành quests, leo level, và trở thành người bạn muốn.
          </AppText>
        </Animated.View>

        <View style={styles.cards}>
          {FEATURE_CARDS.map((card, i) => (
            <FeatureCard
              key={card.title}
              icon={card.icon}
              title={card.title}
              description={card.description}
              color={card.color}
              delay={200 + i * 100}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <Button
            variant="primary"
            fullWidth
            onPress={() => router.push('/(auth)/register')}
            style={styles.primaryBtn}
          >
            Bắt đầu ngay
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onPress={() => router.push('/(auth)/login')}
          >
            Đã có tài khoản
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['2xl'],
  },
  header: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.85,
  },
  cards: {
    gap: Spacing.cardGap,
    marginBottom: Spacing.xl,
  },
  featureCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  featureCardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureIcon: {
    fontSize: 22,
  },
  featureText: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    marginBottom: 2,
  },
  actions: {
    gap: Spacing.sm,
  },
  primaryBtn: {
    shadowColor: Colors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
