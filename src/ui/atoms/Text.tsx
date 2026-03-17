import React from 'react';
import { Text as RNText, StyleSheet, TextProps } from 'react-native';
import { useTheme } from '@/src/ui/tokens';
import { Typography } from '@/src/ui/tokens/typography';

interface AppTextProps extends TextProps {
  variant?: keyof typeof Typography;
  color?: string;
}

export function AppText({ variant = 'body', color, style, children, ...props }: AppTextProps) {
  const { colors } = useTheme();
  return (
    <RNText
      style={[Typography[variant], { color: color ?? colors.textPrimary }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}
