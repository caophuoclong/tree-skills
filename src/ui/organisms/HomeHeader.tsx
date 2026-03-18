/**
 * HomeHeader — sticky top bar for the Home screen
 *
 * Displays user avatar (initials), level chip, name, and
 * icon buttons for Notifications and Settings.
 * Extracted from index.tsx for maintainability.
 */
import { NeoBrutalBox } from '@/src/ui/atoms';
import { useTheme } from '@/src/ui/tokens';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface HomeHeaderProps {
  name: string;
  level: number;
  unreadCount?: number;
  onNotifications: () => void;
  onSettings: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function HomeHeader({
  name,
  level,
  unreadCount = 0,
  onNotifications,
  onSettings,
}: HomeHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.header}>
      {/* ── Left: avatar + meta ── */}
      <View style={styles.avatarRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{getInitials(name)}</Text>
        </View>
        <View style={styles.avatarMeta}>
          <Text style={styles.levelLabel}>CẤP {level}</Text>
          <Text style={styles.userName}>{name}</Text>
        </View>
      </View>

      {/* ── Right: icon buttons ── */}
      <View style={styles.icons}>
        {/* Notifications */}
        <NeoBrutalBox
          borderColor={colors.glassBorder}
          backgroundColor={colors.bgElevated}
          shadowColor="#000"
          shadowOffsetX={2}
          shadowOffsetY={2}
          borderWidth={1.5}
          borderRadius={18}
          onPress={onNotifications}
          contentStyle={styles.iconBtn}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={colors.textSecondary}
          />
          {unreadCount > 0 && (
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.brandPrimary },
              ]}
            >
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </NeoBrutalBox>

        {/* Settings */}
        <NeoBrutalBox
          borderColor={colors.glassBorder}
          backgroundColor={colors.bgElevated}
          shadowColor="#000"
          shadowOffsetX={2}
          shadowOffsetY={2}
          borderWidth={1.5}
          borderRadius={18}
          onPress={onSettings}
          contentStyle={styles.iconBtn}
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color={colors.textSecondary}
          />
        </NeoBrutalBox>
      </View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 12,
    },
    avatarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    avatarCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.brandPrimary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.textPrimary,
    },
    avatarInitials: {
      fontSize: 14,
      fontFamily: 'SpaceGrotesk-Bold',
      fontWeight: '700',
      color: '#fff',
    },
    avatarMeta: {
      gap: 1,
    },
    levelLabel: {
      fontSize: 10,
      fontFamily: 'SpaceGrotesk-Bold',
      fontWeight: '700',
      color: colors.brandPrimary,
      letterSpacing: 1,
    },
    userName: {
      fontSize: 15,
      fontFamily: 'SpaceGrotesk-SemiBold',
      fontWeight: '600',
      color: colors.textPrimary,
    },
    icons: {
      flexDirection: 'row',
      gap: 8,
    },
    iconBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 3,
    },
    badgeText: {
      fontSize: 9,
      fontFamily: 'SpaceGrotesk-Bold',
      fontWeight: '700',
      color: '#fff',
    },
  });
