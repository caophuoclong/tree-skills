import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/ui/tokens';

type IconSize = 'sm' | 'md' | 'lg' | 'xl';
const SIZE_MAP: Record<IconSize, number> = { sm: 16, md: 20, lg: 24, xl: 32 };

interface IconProps {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: IconSize | number;
  color?: string;
}

export function Icon({ name, size = 'md', color }: IconProps) {
  const { colors } = useTheme();
  const resolvedSize = typeof size === 'number' ? size : SIZE_MAP[size];
  const resolvedColor = color ?? colors.textPrimary;
  return <Ionicons name={name} size={resolvedSize} color={resolvedColor} />;
}
