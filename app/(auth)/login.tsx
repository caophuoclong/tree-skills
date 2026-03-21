/**
 * Login Screen — Neobrutalism style
 * Uses useSignIn hook (Supabase auth)
 */
import React, { useState, useMemo, useRef } from 'react';
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
import { useSignIn } from '@/src/business-logic/auth';
import { useTheme } from '@/src/ui/tokens';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';

// ─── NB constants ──────────────────────────────────────────────────────────────
const NB_BORDER = '#111111';
const NB_SHADOW = '#111111';
const NB_BG_SCREEN_LIGHT = '#FEF9C3'; // warm yellow
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

  const shadowX = focused ? 0 : 4;
  const shadowY = focused ? 0 : 4;

  return (
    <View style={inputStyles.wrapper}>
      <AppText style={inputStyles.label}>{label}</AppText>
      <NeoBrutalBox
        shadowOffsetX={shadowX}
        shadowOffsetY={shadowY}
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
          style={[
            inputStyles.input,
            { color: isDark ? '#F4F4F5' : '#111827' },
          ]}
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
  wrapper: {
    gap: 6,
  },
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

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading, error, clearError } = useSignIn();
  const passwordRef = useRef<TextInput>(null);

  const screenBg = isDark ? NB_BG_SCREEN_DARK : NB_BG_SCREEN_LIGHT;

  const handleLogin = async () => {
    if (!email || !password) return;
    // Just sign in — useAuth will handle navigation based on onboarding status
    await signIn(email, password);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: screenBg }]}>
      {/* Decorative geometric accents */}
      <View style={[styles.decorCircle, { borderColor: NB_BORDER }]} />
      <View style={[styles.decorStar, { backgroundColor: colors.brandPrimary }]} />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <AppText style={[styles.backText, { color: NB_BORDER }]}>← Quay lại</AppText>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <AppText style={styles.emoji}>🧠</AppText>
            <AppText style={[styles.appName, { color: NB_BORDER }]}>LIFESKILLS</AppText>
            <View style={styles.titleRow}>
              <AppText style={[styles.title, { color: NB_BORDER }]}>ĐĂNG NHẬP</AppText>
              <View style={[styles.titleUnderline, { backgroundColor: colors.brandPrimary }]} />
            </View>
            <AppText style={[styles.subtitle, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
              Chào mừng bạn trở lại! 👋
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
            {/* Error banner */}
            {error && (
              <ErrorBanner message={error} onDismiss={clearError} />
            )}

            <NBInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              isDark={isDark}
            />

            <NBInput
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              inputRef={passwordRef}
              isDark={isDark}
            />

            {/* Forgot password */}
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <AppText style={[styles.forgotText, { color: colors.brandPrimary }]}>
                Quên mật khẩu?
              </AppText>
            </TouchableOpacity>

            {/* Submit */}
            <NeoBrutalAccent
              accentColor={(!email || !password || isLoading) ? '#9CA3AF' : colors.brandPrimary}
              strokeColor={NB_BORDER}
              shadowColor={NB_SHADOW}
              shadowOffsetX={4}
              shadowOffsetY={4}
              borderRadius={Radius.sm}
              style={{ alignSelf: 'stretch' }}
              contentStyle={styles.submitContent}
              onPress={handleLogin}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <AppText style={styles.submitText}>ĐĂNG NHẬP →</AppText>
              )}
            </NeoBrutalAccent>
          </NeoBrutalBox>

          {/* Footer */}
          <View style={styles.footer}>
            <AppText style={[styles.footerText, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
              Chưa có tài khoản?{' '}
            </AppText>
            <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
              <AppText style={[styles.footerLink, { color: NB_BORDER }]}>
                Đăng ký ngay
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
  safe: {
    flex: 1,
  },
  kav: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: 48,
  },

  // Decorative
  decorCircle: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    opacity: 0.15,
  },
  decorStar: {
    position: 'absolute',
    bottom: 80,
    left: 24,
    width: 24,
    height: 24,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
    opacity: 0.4,
  },

  // Back
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.xl,
  },
  backText: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontWeight: '600',
  },

  // Header
  header: {
    marginBottom: Spacing['2xl'],
    gap: 4,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  appName: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '700',
    letterSpacing: 3,
  },
  titleRow: {
    marginTop: 4,
    marginBottom: 2,
  },
  title: {
    fontSize: 38,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '800',
    lineHeight: 40,
  },
  titleUnderline: {
    height: 5,
    width: 80,
    marginTop: 4,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk-Regular',
    marginTop: 8,
  },

  // Card
  card: {
    alignSelf: 'stretch',
    marginBottom: Spacing.xl,
  },
  cardContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },

  // Forgot
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Submit
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

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  footerLink: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
