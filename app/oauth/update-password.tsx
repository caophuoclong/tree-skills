/**
 * Update Password Screen
 *
 * Reached after a successful password-reset OTP verification in
 * /oauth/consent (type=recovery). At this point Supabase has already
 * established an authenticated session, so we can call
 * `supabase.auth.updateUser({ password })` directly.
 *
 * Route: lifeskills:///oauth/update-password
 */

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/src/business-logic/api/supabase";
import { NeoBrutalAccent, NeoBrutalBox } from "@/src/ui/atoms/NeoBrutalBox";
import { AppText } from "@/src/ui/atoms/Text";
import { useTheme } from "@/src/ui/tokens";
import { Radius, Spacing } from "@/src/ui/tokens/spacing";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự.";
  if (!/[A-Z]/.test(pw)) return "Cần ít nhất 1 chữ hoa.";
  if (!/[0-9]/.test(pw)) return "Cần ít nhất 1 chữ số.";
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UpdatePasswordScreen() {
  const { colors, isDark } = useTheme();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const bg = isDark ? "#1a1a1d" : "#EFF6FF";
  const inputBg = isDark ? "#28282E" : "#FFFFFF";
  const inputBorder = isDark ? "#3a3a44" : "#D1D5DB";
  const labelColor = isDark ? "#A0A0B0" : "#6B7280";

  async function handleSubmit() {
    setFieldError(null);
    setServerError(null);

    const pwErr = validatePassword(password);
    if (pwErr) {
      setFieldError(pwErr);
      return;
    }

    if (password !== confirm) {
      setFieldError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    setSuccess(true);
    // Brief delay so user sees the success state before redirect
    setTimeout(() => router.replace("/(tabs)"), 1800);
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
        <View style={styles.center}>
          <NeoBrutalAccent
            accentColor="#D1FAE5"
            strokeColor="#10B981"
            shadowOffsetX={5}
            shadowOffsetY={5}
            borderRadius={Radius.md}
            style={styles.card}
            contentStyle={styles.cardContent}
          >
            <AppText style={styles.cardIcon}>🎉</AppText>
            <AppText style={[styles.cardTitle, { color: "#065F46" }]}>
              Mật khẩu đã được cập nhật!
            </AppText>
            <AppText style={[styles.cardHint, { color: "#047857" }]}>
              Đang đưa bạn vào ứng dụng...
            </AppText>
          </NeoBrutalAccent>
        </View>
      </SafeAreaView>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: bg }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.replace("/(auth)/login")}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.titleBlock}>
            <AppText style={[styles.pageTitle, { color: colors.textPrimary }]}>
              Đặt mật khẩu mới
            </AppText>
            <AppText style={[styles.pageSub, { color: labelColor }]}>
              Chọn mật khẩu mạnh — ít nhất 8 ký tự, 1 chữ hoa, 1 số.
            </AppText>
          </View>

          {/* Card */}
          <NeoBrutalBox
            shadowOffsetX={6}
            shadowOffsetY={6}
            shadowColor="#111"
            borderColor="#111"
            backgroundColor={isDark ? "#1E1E22" : "#FFFFFF"}
            borderRadius={Radius.md}
            borderWidth={2.5}
            style={styles.formCard}
            contentStyle={styles.formContent}
          >
            {/* New password field */}
            <View style={styles.fieldGroup}>
              <AppText style={[styles.label, { color: labelColor }]}>
                Mật khẩu mới
              </AppText>
              <View
                style={[
                  styles.inputWrap,
                  { backgroundColor: inputBg, borderColor: inputBorder },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Nhập mật khẩu mới"
                  placeholderTextColor={labelColor}
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setFieldError(null);
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPw((v) => !v)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPw ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={labelColor}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm password field */}
            <View style={styles.fieldGroup}>
              <AppText style={[styles.label, { color: labelColor }]}>
                Xác nhận mật khẩu
              </AppText>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: inputBg,
                    borderColor:
                      confirm && confirm !== password ? "#EF4444" : inputBorder,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor={labelColor}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  value={confirm}
                  onChangeText={(t) => {
                    setConfirm(t);
                    setFieldError(null);
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm((v) => !v)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showConfirm ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={labelColor}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Inline field error */}
            {fieldError && (
              <AppText style={styles.errorText}>{fieldError}</AppText>
            )}
          </NeoBrutalBox>

          {/* Server error */}
          {serverError && (
            <NeoBrutalAccent
              accentColor="#FEE2E2"
              strokeColor="#EF4444"
              shadowOffsetX={4}
              shadowOffsetY={4}
              borderRadius={Radius.sm}
              style={{ marginTop: Spacing.md }}
              contentStyle={styles.serverErrContent}
            >
              <AppText style={styles.serverErrText}>{serverError}</AppText>
            </NeoBrutalAccent>
          )}

          {/* Submit button */}
          <NeoBrutalAccent
            accentColor={loading ? "#9CA3AF" : "#111111"}
            strokeColor="#111"
            shadowOffsetX={4}
            shadowOffsetY={4}
            borderRadius={Radius.sm}
            style={{ marginTop: Spacing.lg }}
            contentStyle={styles.submitContent}
            onPress={loading ? undefined : handleSubmit}
          >
            <AppText style={styles.submitText}>
              {loading ? "Đang lưu..." : "✓ Lưu mật khẩu mới"}
            </AppText>
          </NeoBrutalAccent>

          {/* Back to login */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.replace("/(auth)/login")}
            activeOpacity={0.7}
          >
            <AppText style={[styles.cancelText, { color: labelColor }]}>
              Huỷ — về trang đăng nhập
            </AppText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.screenPadding,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: 48,
  },

  headerRow: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },

  titleBlock: {
    marginBottom: Spacing.xl,
    gap: 6,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "800",
    lineHeight: 34,
  },
  pageSub: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk-Regular",
    lineHeight: 20,
  },

  formCard: { alignSelf: "stretch" },
  formContent: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },

  fieldGroup: { gap: 6 },
  label: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk-SemiBold",
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "SpaceGrotesk-Regular",
  },
  eyeBtn: {
    paddingLeft: 8,
    paddingVertical: 4,
  },

  errorText: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk-Medium",
    color: "#EF4444",
    marginTop: 2,
  },

  serverErrContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  serverErrText: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk-Medium",
    color: "#B91C1C",
    textAlign: "center",
  },

  submitContent: {
    paddingVertical: 16,
    alignItems: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  cancelBtn: {
    marginTop: Spacing.md,
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk-Regular",
  },

  // reused from consent.tsx for success card
  card: { alignSelf: "stretch" },
  cardContent: {
    padding: Spacing.xl,
    alignItems: "center",
    gap: Spacing.sm,
  },
  cardIcon: { fontSize: 48, marginBottom: 4 },
  cardTitle: {
    fontSize: 20,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "800",
    textAlign: "center",
  },
  cardHint: {
    fontSize: 14,
    fontFamily: "SpaceGrotesk-Regular",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 4,
  },
});
