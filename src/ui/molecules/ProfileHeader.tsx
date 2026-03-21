import { StyleSheet, Text, View } from 'react-native';
import { NeoBrutalBox } from '@/src/ui/atoms';
import { IColors, useTheme } from '@/src/ui/tokens';

interface ProfileHeaderProps {
  name: string | null;
  level: number | null;
  totalXP: number | null;
  initials: string;
}

export function ProfileHeader({
  name,
  level,
  totalXP,
  initials,
}: ProfileHeaderProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.avatarSection}>
      {/* Avatar circle — NeoBrutalBox as circle */}
      <View style={styles.avatarContainer}>
        <NeoBrutalBox
          borderRadius={44}
          borderColor={colors.brandPrimary}
          backgroundColor={colors.bgSurface}
          shadowColor="#000"
          shadowOffsetX={4}
          shadowOffsetY={4}
          borderWidth={3}
          contentStyle={{
            width: 88,
            height: 88,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={[styles.avatarInitials, { color: colors.textPrimary }]}>
            {initials}
          </Text>
        </NeoBrutalBox>

        {/* Level badge — absolute overlay */}
        <NeoBrutalBox
          borderRadius={20}
          borderColor={colors.brandPrimary}
          backgroundColor={colors.bgSurface}
          shadowColor="#000"
          shadowOffsetX={2}
          shadowOffsetY={2}
          borderWidth={2}
          style={styles.levelBadge}
          contentStyle={{ paddingHorizontal: 8, paddingVertical: 3 }}
        >
          <Text style={[styles.levelBadgeText, { color: colors.brandPrimary }]}>
            LVL {level ?? '?'}
          </Text>
        </NeoBrutalBox>
      </View>

      <Text style={[styles.userName, { color: colors.textPrimary }]}>
        {name ?? ''}
      </Text>
      <Text style={[styles.userSubtitle, { color: colors.textSecondary }]}>
        Level {level ?? '?'} · {totalXP != null ? totalXP.toLocaleString() : '—'} XP
      </Text>
    </View>
  );
}

const createStyles = (colors: IColors) =>
  StyleSheet.create({
    avatarSection: {
      alignItems: 'center',
      paddingVertical: 28,
      paddingHorizontal: 20,
    },
    avatarContainer: { position: 'relative', marginBottom: 14 },
    avatarInitials: { fontSize: 26, fontWeight: '900' },
    levelBadge: { position: 'absolute', bottom: -4, right: -8 },
    levelBadgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
    userName: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
    userSubtitle: {
      fontSize: 12,
      fontFamily: 'SpaceGrotesk-SemiBold',
      fontWeight: '600',
      marginTop: 2,
    },
  });
