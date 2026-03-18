import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppText } from '@/src/ui/atoms/Text';
import { Button } from '@/src/ui/atoms/Button';
import { useUserStore } from '@/src/business-logic/stores/userStore';
import { userService } from '@/src/business-logic/api/services/userService';
import { useTheme } from '@/src/ui/tokens';

import { Spacing, Radius } from '@/src/ui/tokens/spacing';


export default function LoginScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useUserStore((s) => s.setUser);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      // In production: POST /auth/login first, then fetch user
      // For now: simulate auth then fetch mock user from network layer
      const user = await userService.getMe();
      setUser(user);
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <AppText variant="bodyLG" color={colors.textSecondary}>
              ← Quay lại
            </AppText>
          </TouchableOpacity>

          <View style={styles.header}>
            <AppText variant="displayXL" style={styles.title}>
              Đăng nhập
            </AppText>
            <AppText variant="bodyLG" color={colors.textSecondary}>
              Chào mừng bạn trở lại!
            </AppText>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <AppText variant="caption" color={colors.textMuted} style={styles.fieldLabel}>
                EMAIL
              </AppText>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldGroup}>
              <AppText variant="caption" color={colors.textMuted} style={styles.fieldLabel}>
                MẬT KHẨU
              </AppText>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            <Button
              variant="primary"
              fullWidth
              loading={loading}
              onPress={handleLogin}
              disabled={!email || !password}
              style={styles.submitBtn}
            >
              Đăng nhập
            </Button>
          </View>

          <View style={styles.footer}>
            <AppText variant="body" color={colors.textSecondary}>
              Chưa có tài khoản?{' '}
            </AppText>
            <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
              <AppText variant="body" color={colors.brandPrimary} style={styles.link}>
                Đăng ký
              </AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  kav: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing['2xl'],
    gap: Spacing.sm,
  },
  title: {
    color: colors.textPrimary,
  },
  form: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  fieldGroup: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  input: {
    height: 56,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  submitBtn: {
    marginTop: Spacing.sm,
    shadowColor: colors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    fontFamily: 'SpaceGrotesk-SemiBold', fontWeight: '600',
  },
});
