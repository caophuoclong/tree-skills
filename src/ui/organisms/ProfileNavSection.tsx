import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { NeoBrutalAccent, NeoBrutalBox } from '@/src/ui/atoms';
import { useTheme } from '@/src/ui/tokens';

interface Props {
  onLogout: () => void;
}

export function ProfileNavSection({ onLogout }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <NeoBrutalBox
        borderColor={colors.glassBorder}
        backgroundColor={colors.bgSurface}
        shadowColor="#000"
        shadowOffsetX={3}
        shadowOffsetY={3}
        borderWidth={1.5}
        borderRadius={14}
        onPress={() => router.push('/roadmap')}
        contentStyle={styles.navContent}
      >
        <Ionicons name="map-outline" size={20} color={colors.textPrimary} />
        <Text style={[styles.navText, { color: colors.textPrimary }]}>
          Lộ Trình Dài Hạn
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </NeoBrutalBox>

      <NeoBrutalBox
        borderColor={colors.glassBorder}
        backgroundColor={colors.bgSurface}
        shadowColor="#000"
        shadowOffsetX={3}
        shadowOffsetY={3}
        borderWidth={1.5}
        borderRadius={14}
        onPress={() => router.push('/settings')}
        contentStyle={styles.navContent}
      >
        <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
        <Text style={[styles.navText, { color: colors.textPrimary }]}>
          Cài đặt
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </NeoBrutalBox>

      <NeoBrutalBox
        borderColor={colors.glassBorder}
        backgroundColor={colors.bgSurface}
        shadowColor="#000"
        shadowOffsetX={3}
        shadowOffsetY={3}
        borderWidth={1.5}
        borderRadius={14}
        onPress={() => router.push('/leaderboard')}
        contentStyle={styles.navContent}
      >
        <Ionicons name="trophy-outline" size={20} color={colors.textPrimary} />
        <Text style={[styles.navText, { color: colors.textPrimary }]}>
          Bảng xếp hạng
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </NeoBrutalBox>

      <NeoBrutalAccent
        accentColor={`${colors.danger}`}
        strokeColor={colors.textPrimary}
        shadowOffsetX={3}
        shadowOffsetY={3}
        borderWidth={1.5}
        borderRadius={14}
        onPress={onLogout}
        contentStyle={styles.navContent}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.textPrimary} />
        <Text style={[styles.navText, { color: colors.textPrimary }]}>
          Đăng xuất
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={`${colors.danger}80`}
        />
      </NeoBrutalAccent>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginHorizontal: 20, marginTop: 24, gap: 10 },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  navText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontWeight: '600',
    flex: 1,
  },
});
