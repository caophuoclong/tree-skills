/**
 * Forgot Password Screen — Neobrutalism style
 * Uses useResetPassword hook (Supabase auth)
 */
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppText } from '@/src/ui/atoms/Text';
import { NeoBrutalBox, NeoBrutalAccent } from '@/src/ui/atoms/NeoBrutalBox';
import { useResetPassword } from '@/src/business-logic/auth';
import { useTheme } from '@/src/ui/tokens';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';

// ─── NB constants ──────────────────────────────────────────────────────────────
const NB_BORDER = '#111111';
const NB_SHADOW = '#111111';
const NB_BG_LIGHT = '#EFF6FF'; // soft blue
const NB_BG_DARK  = '#1a1a1d';

// ─── Email Sent State ──────────────────────────────────────────────────────────

function EmailSentCard({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <View style={sentStyles.container}>
      <AppText style={sentStyles.icon}>✉️</AppText>

      <NeoBrutalBox
        shadowOffsetX={6}
        shadowOffsetY={6}
        shadowColor={NB_SHADOW}
        borderColor={NB_BORDER}
        backgroundColor="#FFFFFF"
        borderRadius={Radius.md}
        borderWidth={2.5}
        style={{ alignSelf: 'stretch' }}
        contentStyle={{ padding: Spacing.lg, gap: Spacing.md }}
      >
        <AppText style={sentStyles.title}>Đã gửi!</AppText>
        <AppText style={sentStyles.body}>
          Link đặt lại mật khẩu đã được gửi tới
        </AppText>

        <NeoBrutalAccent
          accentColor="#DBEAFE"
          strokeColor="#3B82F6"
          shadowColor="#3B82F6"
          shadowOffsetX={3}
          shadowOffsetY={3}
          borderRadius={Radius.sm}
          style={{ alignSelf: 'stretch' }}
          contentStyle={{ padding: Spacing.sm, alignItems: 'center' }}
        >
          <AppText style={sentStyles.emailText}>{email}</AppText>
        </NeoBrutalAccent>

        <AppText style={sentStyles.hint}>
          Kiểm tra hộp thư (kể cả thư mục spam) và nhấn vào link trong email để đặt lại mật khẩu.
        </AppText>
      </NeoBrutalBox>

      <NeoBrutalAccent
        accentColor="#111111"
        strokeColor="#111111"
        shadowColor="#7C6AF7"
        shadowOffsetX={4}
        shadowOffsetY={4}
        borderRadius={Radius.sm}
        style={{ alignSelf: 'stretch' }}
        contentStyle={sentStyles.backBtnContent}
        onPress={onBack}
      >
        <AppText style={sentStyles.backBtnText}>← Về trang đăng nhập</AppText>
      </NeoBrutalAccent>
    </View>
  );
}

const sentStyles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.xl },
  icon: { fontSize: 64, textAlign: 'center' },
  title: {
    fontSize: 24,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '800',
    color: NB_BORDER,
  },
  body: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk-Regular',
    color: '#4B5563',
  },
  emailText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '700',
    color: '#1D4ED8',
  },
  hint: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  backBtnContent: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ForgotPasswordScreen() {
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const { sendResetEmail, isLoading, error, sent } = useResetPassword();

  const screenBg = isDark ? NB_BG_DARK : NB_BG_LIGHT;
  const canSubmit = !!email && !isLoading;

  const handleSend = async () => {
    if (!canSubmit) return;
    await sendResetEmail(email);
  };

  // ── Sent state ───────────────────────────────────────────────────────────────
  if (sent) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: screenBg }]}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: 60 }]}>
          <EmailSentCard
            email={email}
            onBack={() => router.replace('/(auth)/login')}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: screenBg }]}>
      {/* Decorative elements */}
      <View style={[styles.decorSquare, { borderColor: NB_BORDER }]} />
      <View style={[styles.decorDot, { backgroundColor: colors.brandPrimary }]} />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <AppText style={[styles.backText, { color: NB_BORDER }]}>← Quay lại</AppText>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <AppText style={styles.emoji}>🔐</AppText>
            <View style={styles.titleRow}>
              <AppText style={[styles.title, { color: NB_BORDER }]}>QUÊN{'\n'}MẬT KHẨU?</AppText>
              <View style={[styles.titleUnderline, { backgroundColor: colors.brandPrimary }]} />
            </View>
            <AppText style={[styles.subtitle, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
              Nhập email để nhận link đặt lại mật khẩu
            </AppText>
          </View>

          {/* Form card */}
          <NeoBrutalBox
            shadowOffsetX={6}
            shadowOffsetY={6}
            shadowColor={NB_SHADOW}
            borderColor={NB_BORDER}
            backgroundColor={isDark ? '#1E1E22' : '#FFFFFF'}
            borderRadius={Radius.md}
            borderWidth={2.5}
            style={styles.card}
            contentStyle={styles.cardContent}
          >
            {/* Error */}
            {error && (
              <NeoBrutalAccent
                accentColor="#FEE2E2"
                strokeColor="#EF4444"
                shadowColor="#EF4444"
                shadowOffsetX={3}
                shadowOffsetY={3}
                borderRadius={Radius.sm}
                style={{ alignSelf: 'stretch' }}
                contentStyle={{ padding: Spacing.sm }}
              >
                <AppText style={{ color: '#B91C1C', fontFamily: 'SpaceGrotesk-SemiBold', fontWeight: '600', fontSize: 13 }}>
                  {error}
                </AppText>
              </NeoBrutalAccent>
            )}

            {/* Email input */}
            <View style={styles.fieldWrapper}>
              <AppText style={styles.fieldLabel}>EMAIL</AppText>
              <NeoBrutalBox
                shadowOffsetX={focused ? 0 : 4}
                shadowOffsetY={focused ? 0 : 4}
                shadowColor={NB_SHADOW}
                borderColor={NB_BORDER}
                backgroundColor={isDark ? '#2b2b2e' : '#FFFFFF'}
                borderRadius={Radius.sm}
                borderWidth={2.5}
                style={{ alignSelf: 'stretch' }}
                contentStyle={{ padding: 0 }}
              >
                <TextInput
                  style={[styles.input, { color: isDark ? '#F4F4F5' : '#111827' }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  placeholderTextColor={isDark ? '#52525B' : '#9CA3AF'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSend}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                />
              </NeoBrutalBox>
            </View>

            {/* Submit */}
            <NeoBrutalAccent
              accentColor={canSubmit ? colors.brandPrimary : '#9CA3AF'}
              strokeColor={NB_BORDER}
              shadowColor={NB_SHADOW}
              shadowOffsetX={4}
              shadowOffsetY={4}
              borderRadius={Radius.sm}
              style={{ alignSelf: 'stretch' }}
              contentStyle={styles.submitContent}
              onPress={handleSend}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <AppText style={styles.submitText}>GỬI LINK ĐẶT LẠI →</AppText>
              )}
            </NeoBrutalAccent>
          </NeoBrutalBox>

          {/* Footer links */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <AppText style={[styles.footerLink, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                Nhớ ra rồi? Đăng nhập →
              </AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: 48,
  },

  decorSquare: {
    position: 'absolute',
    top: 60,
    right: -30,
    width: 100,
    height: 100,
    borderWidth: 3,
    borderRadius: 8,
    transform: [{ rotate: '15deg' }],
    opacity: 0.12,
  },
  decorDot: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    width: 16,
    height: 16,
    borderRadius: 8,
    opacity: 0.45,
  },

  backBtn: { alignSelf: 'flex-start', marginBottom: Spacing.xl },
  backText: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontWeight: '600',
  },

  header: { marginBottom: Spacing['2xl'], gap: 4 },
  emoji: { fontSize: 40, marginBottom: 4 },
  titleRow: { marginTop: 4, marginBottom: 2 },
  title: {
    fontSize: 36,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '800',
    lineHeight: 40,
  },
  titleUnderline: {
    height: 5,
    width: 80,
    marginTop: 6,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk-Regular',
    marginTop: 8,
    lineHeight: 22,
  },

  card: { alignSelf: 'stretch', marginBottom: Spacing.xl },
  cardContent: { padding: Spacing.lg, gap: Spacing.md },

  fieldWrapper: { gap: 6 },
  fieldLabel: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: NB_BORDER,
  },
  input: {
    height: 52,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-Regular',
  },

  submitContent: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '800',
    letterSpacing: 1,
  },

  footer: {
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
