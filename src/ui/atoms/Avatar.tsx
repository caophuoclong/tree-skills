import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/src/ui/tokens';


type AvatarSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<AvatarSize, number> = { sm: 32, md: 48, lg: 80 };
const FONT_MAP: Record<AvatarSize, number> = { sm: 12, md: 18, lg: 30 };

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ uri, name, size = 'md', style }: AvatarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dim = SIZE_MAP[size];
  const fontSize = FONT_MAP[size];

  return (
    <View style={[styles.container, { width: dim, height: dim, borderRadius: dim / 2 }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: dim, height: dim, borderRadius: dim / 2 }}
          contentFit="cover"
        />
      ) : (
        <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
      )}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
