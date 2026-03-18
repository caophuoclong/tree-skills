/**
 * Register Screen — Neobrutalism style
 * Uses useSignUp hook (Supabase auth)
 * Handles email confirmation required state
 */
import React, { useState, useRef } from 'react';
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
import { useSignUp } from '@/src/business-logic/auth';
import { useTheme } from '@/src/ui/tokens';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';

// ─── NB constants ──────────────────────────────────────────────────────────────
const NB_BORDER = '#111111';
const NB_SHADOW = '#111111';
const NB_BG_SCREEN_LIGHT = '#ECFDF5'; // fresh mint green
const NB_BG_SCREEN_DARK  = '#1a1a1d';

// ─── NB Input ──────────────────────────────────────────────────────────────────

interface NBInputProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInput['props']['keyboardType'];
  autoCapitalize?: TextInput['props']['autoCapitalize'];
  returnKeyType?: TextInput['props']['returnKeyType'];
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput>;
  isDark: boolean;
}

function NBInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  returnKeyType,
  onSubmitEditing,
  inputRef,
  isDark,
}: NBInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={inputStyles.wrapper}>
      <AppText style={inputStyles.label}>{label}</AppText>
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
          ref={inputRef}
          style={[inputStyles.input, { color: isDark ? '#F4F4F5' : '#111827' }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#52525B' : '#9CA3AF'}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </NeoBrutalBox>
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
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
});

// ─── Error banner ──────────────────────────────────────────────────────────────

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText style={{ color: '#B91C1C', fontFamily: 'SpaceGrotesk-SemiBold', fontWeight: '600', fontSize: 13, flex: 1 }}>
          {message}
        </AppText>
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <AppText style={{ color: '#B91C1C', fontSize: 16, marginLeft: 8 }}>✕</AppText>
        </TouchableOpacity>
      </View>
    </NeoBrutalAccent>
  );
}

// ─── Email confirmation state ──────────────────────────────────────────────────

function EmailConfirmationCard({ email }: { email: string }) {
  return (
    <View style={confirmStyles.container}>
      <AppText style={confirmStyles.icon}>📬</AppText>
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
        <AppText style={confirmStyles.title}>Kiểm tra email!</AppText>
        <AppText style={confirmStyles.body}>
          Chúng tôi đã gửi link xác nhận đến
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
          <AppText style={confirmStyles.emailText}>{email}</AppText>
        </NeoBrutalAccent>
        <AppText style={confirmStyles.hint}>
          Mở email, nhấn vào link và bạn có thể đăng nhập ngay! 🎉
        </AppText>
      </NeoBrutalBox>

      <TouchableOpacity
        style={confirmStyles.loginLink}
        onPress={() => router.replace('/(auth)/login')}
      >
        <AppText style={confirmStyles.loginLinkText}>
          Về trang đăng nhập →
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

const confirmStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.xl,
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
  },
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
  loginLink: {
    paddingVertical: 8,
  },
  loginLinkText: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '700',
    color: NB_BORDER,
    textDecorationLine: 'underline',
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const { colors, isDark } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, isLoading, error, needsEmailConfirmation, clearError } = useSignUp();

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const screenBg = isDark ? NB_BG_SCREEN_DARK : NB_BG_SCREEN_LIGHT;
  const canSubmit = !!name && !!email && !!password && !isLoading;

  const handleRegister = async () => {
    if (!canSubmit) return;
    const success = await signUp(email, password, name);
    if (success && !needsEmailConfirmation) {
      router.replace('/(tabs)');
    }
    // if needsEmailConfirmation → UI shows the confirmation card automatically
  };

  // ── Email confirmation screen ────────────────────────────────────────────────
  if (needsEmailConfirmation) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: screenBg }]}>
        <ScrollView contentContainerStyle={[styles.scroll, { justifyContent: 'center', flex: 1 }]}>
          <EmailConfirmationCard email={email} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Registration form ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: screenBg }]}>
      {/* Decorative */}
      <View style={[styles.decorCircle, { borderColor: NB_BORDER }]} />
      <View style={[styles.decorDot, { backgroundColor: colors.finance }]} />

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
            <AppText style={styles.emoji}>🚀</AppText>
            <AppText style={[styles.appName, { color: NB_BORDER }]}>LIFESKILLS</AppText>
            <View style={styles.titleRow}>
              <AppText style={[styles.title, { color: NB_BORDER }]}>TẠO TÀI{'\n'}KHOẢN</AppText>
              <View style={[styles.titleUnderline, { backgroundColor: colors.finance }]} />
            </View>
            <AppText style={[styles.subtitle, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
              Bắt đầu hành trình phát triển bản thân 💪
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
            {error && <ErrorBanner message={error} onDismiss={clearError} />}

            <NBInput
              label="Tên của bạn"
              value={name}
              onChangeText={setName}
              placeholder="Nguyễn Văn A"
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              isDark={isDark}
            />

            <NBInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              inputRef={emailRef}
              isDark={isDark}
            />

            <NBInput
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              placeholder="Tối thiểu 6 ký tự"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              inputRef={passwordRef}
              isDark={isDark}
            />

            {/* Password strength hint */}
            {password.length > 0 && password.length < 6 && (
              <AppText style={styles.pwHint}>⚠️ Cần ít nhất 6 ký tự</AppText>
            )}

            {/* Submit */}
            <NeoBrutalAccent
              accentColor={canSubmit ? colors.finance : '#9CA3AF'}
              strokeColor={NB_BORDER}
              shadowColor={NB_SHADOW}
              shadowOffsetX={4}
              shadowOffsetY={4}
              borderRadius={Radius.sm}
              style={{ alignSelf: 'stretch' }}
              contentStyle={styles.submitContent}
              onPress={handleRegister}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <AppText style={styles.submitText}>TẠO TÀI KHOẢN →</AppText>
              )}
            </NeoBrutalAccent>

            {/* Terms hint */}
            <AppText style={[styles.termsText, { color: isDark ? '#52525B' : '#9CA3AF' }]}>
              Bằng cách đăng ký, bạn đồng ý với điều khoản sử dụng của chúng tôi.
            </AppText>
          </NeoBrutalBox>

          {/* Footer */}
          <View style={styles.footer}>
            <AppText style={[styles.footerText, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
              Đã có tài khoản?{' '}
            </AppText>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <AppText style={[styles.footerLink, { color: NB_BORDER }]}>Đăng nhập</AppText>
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

  decorCircle: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    opacity: 0.12,
  },
  decorDot: {
    position: 'absolute',
    bottom: 100,
    right: 28,
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.5,
  },

  backBtn: { alignSelf: 'flex-start', marginBottom: Spacing.xl },
  backText: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontWeight: '600',
  },

  header: { marginBottom: Spacing['2xl'], gap: 4 },
  emoji: { fontSize: 40, marginBottom: 4 },
  appName: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '700',
    letterSpacing: 3,
  },
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
  },

  card: { alignSelf: 'stretch', marginBottom: Spacing.xl },
  cardContent: { padding: Spacing.lg, gap: Spacing.md },

  pwHint: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk-Regular',
    color: '#F59E0B',
    marginTop: -4,
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

  termsText: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk-Regular',
    textAlign: 'center',
    lineHeight: 16,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { fontSize: 14, fontFamily: 'SpaceGrotesk-Regular' },
  footerLink: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
