import React from 'react';
import { Text as RNText, StyleSheet, TextProps } from 'react-native';
import { Colors } from '@/src/ui/tokens/colors';
import { Typography } from '@/src/ui/tokens/typography';

interface AppTextProps extends TextProps {
  variant?: keyof typeof Typography;
  color?: string;
}

export function AppText({ variant = 'body', color, style, children, ...props }: AppTextProps) {
  return (
    <RNText
      style={[Typography[variant], { color: color ?? Colors.textPrimary }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}
