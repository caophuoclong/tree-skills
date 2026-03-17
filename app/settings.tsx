import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/ui/tokens';
import { AppText } from '@/src/ui/atoms/Text';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';
import { useThemeStore } from '@/src/business-logic/stores/themeStore';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const { themeMode, setThemeMode } = useThemeStore();

  const handleBack = () => router.back();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="title" style={styles.headerTitle}>Cài đặt</AppText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Appearance Section */}
        <View style={styles.sectionHeader}>
          <AppText variant="caption" style={styles.sectionTitle}>Giao diện (Chưa hoạt động)</AppText>
        </View>

        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.settingRow} 
            onPress={() => setThemeMode('light')}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="sunny" size={20} color={colors.warning} />
            </View>
            <View style={styles.settingTextContainer}>
              <AppText variant="body" style={styles.settingLabel}>Nền sáng</AppText>
            </View>
            {themeMode === 'light' && (
              <Ionicons name="checkmark" size={24} color={colors.brandPrimary} />
            )}
          </TouchableOpacity>
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => setThemeMode('dark')}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="moon" size={20} color={colors.brandPrimary} />
            </View>
            <View style={styles.settingTextContainer}>
              <AppText variant="body" style={styles.settingLabel}>Nền tối</AppText>
            </View>
            {themeMode === 'dark' && (
              <Ionicons name="checkmark" size={24} color={colors.brandPrimary} />
            )}
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => setThemeMode('system')}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="phone-portrait-outline" size={20} color={colors.textSecondary} />
            </View>
            <View style={styles.settingTextContainer}>
              <AppText variant="body" style={styles.settingLabel}>Theo hệ thống</AppText>
            </View>
            {themeMode === 'system' && (
              <Ionicons name="checkmark" size={24} color={colors.brandPrimary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.sectionHeader}>
          <AppText variant="caption" style={styles.sectionTitle}>Thông báo</AppText>
        </View>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="notifications" size={20} color={colors.softskills} />
            </View>
            <View style={styles.settingTextContainer}>
              <AppText variant="body" style={styles.settingLabel}>Nhắc nhở hàng ngày</AppText>
            </View>
            <Ionicons name="toggle" size={32} color={colors.brandPrimary} />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.sectionHeader}>
          <AppText variant="caption" style={styles.sectionTitle}>Tài khoản</AppText>
        </View>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="person" size={20} color={colors.career} />
            </View>
            <View style={styles.settingTextContainer}>
              <AppText variant="body" style={styles.settingLabel}>Thông tin cá nhân</AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="log-out" size={20} color={colors.danger} />
            </View>
            <View style={styles.settingTextContainer}>
              <AppText variant="body" style={[styles.settingLabel, { color: colors.danger }]}>Đăng xuất</AppText>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBaseDayMode,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    color: colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: colors.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.glassBorder,
    marginLeft: Spacing.md + 36 + Spacing.md,
  },
});
