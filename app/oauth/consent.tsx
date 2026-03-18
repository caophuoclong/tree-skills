/**
 * OAuth Consent / Deep-Link Handler
 *
 * Handles ALL Supabase auth deep-links that arrive via the custom scheme:
 *   lifeskills:///oauth/consent?...
 *
 * Supported scenarios:
 *  1. Password reset  → token_hash + type=recovery  → verify → /oauth/update-password
 *  2. Email confirm   → token_hash + type=signup|email → verify → /(tabs)
 *  3. Magic link      → token_hash + type=magiclink → verify → /(tabs)
 *  4. OAuth PKCE      → code=...                   → exchange → /(tabs)
 *  5. Error callback  → error + error_description  → show error UI
 *
 * Deep-link is configured in:
 *   app.json           → "scheme": "lifeskills"
 *   useResetPassword   → redirectTo: 'lifeskills:///oauth/consent'
 *   Supabase Dashboard → Site URL / Redirect URLs: lifeskills:///oauth/consent
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { AppText } from '@/src/ui/atoms/Text';
import { NeoBrutalAccent, NeoBrutalBox } from '@/src/ui/atoms/NeoBrutalBox';
import { supabase } from '@/src/business-logic/api/supabase';
import { useTheme } from '@/src/ui/tokens';
import { Radius, Spacing } from '@/src/ui/tokens/spacing';

// ─── Types ────────────────────────────────────────────────────────────────────

type CallbackState =
  | { status: 'processing' }
  | { status: 'error'; message: string }
  | { status: 'success'; message: string };

type SupabaseOtpType =
  | 'signup'
  | 'invite'
  | 'magiclink'
  | 'recovery'
  | 'email'
  | 'email_change';

// ─── Component ────────────────────────────────────────────────────────────────

export default function OAuthConsentScreen() {
  const { colors, isDark } = useTheme();
  const [state, setState] = useState<CallbackState>({ status: 'processing' });

  // Supabase appends params to the URL — collect all of them
  const params = useLocalSearchParams<{
    token_hash?: string;
    type?: string;
    code?: string;
    error?: string;
    error_description?: string;
  }>();

  // Guard: only process once even if params change
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Core callback handler ──────────────────────────────────────────────────

  async function handleCallback() {
    const { token_hash, type, code, error, error_description } = params;

    // ── Case 1: Supabase returned an error ──────────────────────────────────
    if (error) {
      const msg = decodeURIComponent(error_description ?? error ?? 'Unknown error');
      setState({ status: 'error', message: mapError(msg) });
      return;
    }

    // ── Case 2: PKCE OAuth code exchange (Google, GitHub, etc.) ────────────
    if (code) {
      const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeErr) {
        setState({ status: 'error', message: mapError(exchangeErr.message) });
        return;
      }
      setState({ status: 'success', message: 'Đăng nhập thành công!' });
      router.replace('/(tabs)');
      return;
    }

    // ── Case 3: OTP / magic-link via token_hash ─────────────────────────────
    if (token_hash && type) {
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as SupabaseOtpType,
      });

      if (verifyErr) {
        setState({ status: 'error', message: mapError(verifyErr.message) });
        return;
      }

      if (type === 'recovery') {
        // Password reset — redirect to set-new-password screen
        router.replace('/oauth/update-password');
        return;
      }

      // Email confirm / magic link — session is now active → go to app
      setState({ status: 'success', message: 'Xác thực thành công!' });
      router.replace('/(tabs)');
      return;
    }

    // ── Case 4: No recognisable params ─────────────────────────────────────
    setState({
      status: 'error',
      message: 'Liên kết không hợp lệ hoặc đã hết hạn.',
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const bg = isDark ? '#1a1a1d' : '#EFF6FF';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <View style={styles.center}>

        {/* Processing */}
        {state.status === 'processing' && (
          <ProcessingCard isDark={isDark} />
        )}

        {/* Error */}
        {state.status === 'error' && (
          <ErrorCard
            message={state.message}
            onRetry={() => router.replace('/(auth)/login')}
            colors={colors}
          />
        )}

        {/* Success (brief — usually router.replace fires first) */}
        {state.status === 'success' && (
          <SuccessCard message={state.message} />
        )}

      </View>
    </SafeAreaView>
  );
}

// ─── Sub-cards ────────────────────────────────────────────────────────────────

function ProcessingCard({ isDark }: { isDark: boolean }) {
  return (
    <NeoBrutalBox
      shadowOffsetX={6}
      shadowOffsetY={6}
      shadowColor="#111"
      borderColor="#111"
      backgroundColor={isDark ? '#1E1E22' : '#FFFFFF'}
      borderRadius={Radius.md}
      borderWidth={2.5}
      style={styles.card}
      contentStyle={styles.cardContent}
    >
      <AppText style={styles.cardIcon}>🔗</AppText>
      <AppText style={[styles.cardTitle, { color: '#111' }]}>
        Đang xác thực...
      </AppText>
      <ActivityIndicator size="large" color="#7C6AF7" style={{ marginTop: 8 }} />
      <AppText style={styles.cardHint}>
        Vui lòng chờ trong giây lát
      </AppText>
    </NeoBrutalBox>
  );
}

function ErrorCard({
  message,
  onRetry,
  colors,
}: {
  message: string;
  onRetry: () => void;
  colors: any;
}) {
  return (
    <View style={{ gap: Spacing.lg, alignItems: 'stretch', width: '100%' }}>
      <NeoBrutalAccent
        accentColor="#FEE2E2"
        strokeColor="#EF4444"
        shadowColor="#EF4444"
        shadowOffsetX={5}
        shadowOffsetY={5}
        borderRadius={Radius.md}
        style={styles.card}
        contentStyle={styles.cardContent}
      >
        <AppText style={styles.cardIcon}>❌</AppText>
        <AppText style={[styles.cardTitle, { color: '#B91C1C' }]}>
          Xác thực thất bại
        </AppText>
        <AppText style={[styles.cardHint, { color: '#7F1D1D' }]}>
          {message}
        </AppText>
      </NeoBrutalAccent>

      <NeoBrutalAccent
        accentColor="#111111"
        strokeColor="#111"
        shadowColor="#7C6AF7"
        shadowOffsetX={4}
        shadowOffsetY={4}
        borderRadius={Radius.sm}
        style={{ alignSelf: 'stretch' }}
        contentStyle={styles.btnContent}
        onPress={onRetry}
      >
        <AppText style={styles.btnText}>← Về trang đăng nhập</AppText>
      </NeoBrutalAccent>
    </View>
  );
}

function SuccessCard({ message }: { message: string }) {
  return (
    <NeoBrutalAccent
      accentColor="#D1FAE5"
      strokeColor="#10B981"
      shadowColor="#10B981"
      shadowOffsetX={5}
      shadowOffsetY={5}
      borderRadius={Radius.md}
      style={styles.card}
      contentStyle={styles.cardContent}
    >
      <AppText style={styles.cardIcon}>✅</AppText>
      <AppText style={[styles.cardTitle, { color: '#065F46' }]}>
        {message}
      </AppText>
      <AppText style={[styles.cardHint, { color: '#047857' }]}>
        Đang chuyển hướng...
      </AppText>
    </NeoBrutalAccent>
  );
}

// ─── Error mapper ─────────────────────────────────────────────────────────────

function mapError(msg: string): string {
  if (msg.includes('expired') || msg.includes('invalid'))
    return 'Liên kết đã hết hạn. Vui lòng yêu cầu gửi lại.';
  if (msg.includes('already confirmed'))
    return 'Email đã được xác nhận. Bạn có thể đăng nhập.';
  if (msg.includes('Token has expired'))
    return 'Link đã hết hạn (> 1 giờ). Vui lòng yêu cầu lại.';
  return msg;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
  },
  card: {
    alignSelf: 'stretch',
  },
  cardContent: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '800',
    textAlign: 'center',
  },
  cardHint: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Regular',
    textAlign: 'center',
    lineHeight: 20,
    color: '#6B7280',
    marginTop: 4,
  },
  btnContent: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
