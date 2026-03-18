import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSettingsStore } from "@/src/business-logic/stores/settingsStore";
import { useThemeStore } from "@/src/business-logic/stores/themeStore";
import { NeoBrutalAccent, NeoBrutalBox, NeoBrutalThemed } from "@/src/ui/atoms";
import { useTheme } from "@/src/ui/tokens";

// ─── Theme option data ────────────────────────────────────────────────────────
const THEME_OPTIONS = [
  {
    value: "light" as const,
    label: "Nền sáng",
    icon: "sunny" as const,
    color: "#F59E0B",
  },
  {
    value: "dark" as const,
    label: "Nền tối",
    icon: "moon" as const,
    color: "#7C6AF7",
  },
  {
    value: "system" as const,
    label: "Theo hệ thống",
    icon: "phone-portrait-outline" as const,
    color: "#22C55E",
  },
];

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
      {title}
    </Text>
  );
}

// ─── Nav row (with NeoBrutalBox + press animation) ────────────────────────────
function NavRow({
  icon,
  iconColor,
  label,
  onPress,
  rightContent,
  danger,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  label: string;
  onPress?: () => void;
  rightContent?: React.ReactNode;
  danger?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <NeoBrutalBox
      borderColor={danger ? `${colors.danger}60` : colors.glassBorder}
      backgroundColor={danger ? `${colors.danger}0E` : colors.bgSurface}
      shadowColor={danger ? colors.danger : "#000"}
      shadowOffsetX={3}
      shadowOffsetY={3}
      borderWidth={1.5}
      borderRadius={14}
      onPress={onPress}
      contentStyle={styles.navRowContent}
    >
      {/* Icon container */}
      <View style={[styles.iconBox, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text
        style={[
          styles.navLabel,
          { color: danger ? colors.danger : colors.textPrimary },
        ]}
      >
        {label}
      </Text>
      {rightContent ??
        (onPress && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={danger ? `${colors.danger}80` : colors.textMuted}
          />
        ))}
    </NeoBrutalBox>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { themeMode, setThemeMode } = useThemeStore();
  const { dailyNotifications, setDailyNotifications } = useSettingsStore();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bgBase }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.glassBorder }]}>
        <NeoBrutalBox
          borderColor={colors.glassBorder}
          backgroundColor={colors.bgElevated}
          shadowColor="#000"
          shadowOffsetX={2}
          shadowOffsetY={2}
          borderWidth={1.5}
          borderRadius={18}
          onPress={() => router.back()}
          contentStyle={styles.backBtnContent}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={colors.textSecondary}
          />
        </NeoBrutalBox>

        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Cài đặt
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── GIAO DIỆN ──────────────────────────────────────────────────── */}
        <SectionLabel title="GIAO DIỆN" />

        {/* Theme selector — 3 options side-by-side using NeoBrutalAccent / NeoBrutalBox */}
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((opt) => {
            const active = themeMode === opt.value;
            return (
              <View key={opt.value} style={styles.themeOptionSlot}>
                {active ? (
                  <NeoBrutalAccent
                    accentColor={`${colors.bgBase}`}
                    strokeColor={opt.color}
                    shadowOffsetX={4}
                    shadowOffsetY={4}
                    borderWidth={2}
                    borderRadius={14}
                    onPress={() => setThemeMode(opt.value)}
                    style={{
                      height: 80,
                    }}
                    contentStyle={styles.themeOptionContent}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={22}
                      color={colors.textPrimary}
                    />
                    <Text
                      style={[styles.themeLabel, { color: colors.textPrimary }]}
                    >
                      {opt.label}
                    </Text>
                    {/* <View
                      style={[
                        styles.activeDot,
                        { backgroundColor: colors.textPrimary },
                      ]}
                    /> */}
                  </NeoBrutalAccent>
                ) : (
                  <NeoBrutalBox
                    borderColor={colors.glassBorder}
                    backgroundColor={colors.bgSurface}
                    shadowColor="#000"
                    shadowOffsetX={4}
                    shadowOffsetY={4}
                    borderWidth={1.5}
                    borderRadius={14}
                    onPress={() => setThemeMode(opt.value)}
                    style={{
                      height: 80,

                      ...styles.themeOptionInactive,
                    }}
                    contentStyle={styles.themeOptionContent}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={22}
                      color={colors.textMuted}
                    />
                    <Text
                      style={[styles.themeLabel, { color: colors.textMuted }]}
                    >
                      {opt.label}
                    </Text>
                  </NeoBrutalBox>
                )}
              </View>
            );
          })}
        </View>

        {/* ── THÔNG BÁO ──────────────────────────────────────────────────── */}
        <SectionLabel title="THÔNG BÁO" />

        <NavRow
          icon="notifications"
          iconColor={colors.softskills}
          label="Nhắc nhở hàng ngày"
          rightContent={
            <NeoBrutalAccent
              accentColor={
                dailyNotifications ? colors.brandPrimary : colors.bgBase
              }
              strokeColor={
                dailyNotifications ? colors.textPrimary : colors.brandPrimary
              }
              shadowOffsetX={2}
              shadowOffsetY={2}
              borderWidth={1.5}
              borderRadius={10}
              contentStyle={{ paddingHorizontal: 10, paddingVertical: 4 }}
              onPress={() => setDailyNotifications(!dailyNotifications)}
            >
              <Text
                style={[
                  styles.toggleText,
                  {
                    color: dailyNotifications
                      ? colors.textPrimary
                      : colors.brandPrimary,
                  },
                ]}
              >
                {dailyNotifications ? "Bật" : "Tắt"}
              </Text>
            </NeoBrutalAccent>
          }
        />

        {/* ── TÀI KHOẢN ──────────────────────────────────────────────────── */}
        <SectionLabel title="TÀI KHOẢN" />

        <View style={{ gap: 10 }}>
          <NavRow
            icon="person"
            iconColor={colors.career}
            label="Thông tin cá nhân"
            onPress={() => {}}
          />
          <NavRow
            icon="shield-checkmark-outline"
            iconColor={colors.finance}
            label="Bảo mật & Mật khẩu"
            onPress={() => {}}
          />
          <NavRow
            icon="help-circle-outline"
            iconColor={colors.textSecondary}
            label="Trợ giúp & Phản hồi"
            onPress={() => {}}
          />
        </View>

        {/* ── NGUY HIỂM ──────────────────────────────────────────────────── */}
        <SectionLabel title="KHÁC" />

        {/* Version note */}
        <NeoBrutalThemed
          shadowOffsetX={3}
          shadowOffsetY={3}
          borderWidth={1.5}
          borderRadius={12}
          style={{ marginTop: 8 }}
          contentStyle={styles.versionContent}
        >
          <Text style={[styles.versionText, { color: colors.textMuted }]}>
            Life Skills Tree
          </Text>
          <Text style={[styles.versionNum, { color: colors.textPrimary }]}>
            Phiên bản 1.0.0 (build 42)
          </Text>
        </NeoBrutalThemed>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtnContent: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 10,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginTop: 14,
    marginBottom: 2,
  },

  // Theme picker
  themeRow: { flexDirection: "row", gap: 10 },
  themeOptionSlot: {
    flex: 1,
    height: 80,
  },

  themeOptionInactive: {
    opacity: 0.85,
  },
  themeOptionContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 6,
  },
  themeOptionInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: "100%",
  },
  themeLabel: {
    fontSize: 10,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    textAlign: "center",
  },
  activeDot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },

  // Nav row
  navRowContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  navLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "SpaceGrotesk-SemiBold",
    fontWeight: "600",
  },
  toggleText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },

  // Version
  versionContent: { alignItems: "center", paddingVertical: 14 },
  versionText: {
    fontSize: 11,
    fontFamily: "SpaceGrotesk-SemiBold",
    fontWeight: "600",
  },
  versionNum: { fontSize: 12, fontWeight: "800", marginTop: 2 },
});
