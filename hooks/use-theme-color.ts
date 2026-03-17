/**
 * Simplified theme color hook using the new flat token system.
 * Since we use a dark-first design system, this returns token colors directly.
 */

import { Colors } from '@/src/ui/tokens';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors
) {
  // Dark-first design: prefer the provided override, then fall back to token
  return props.dark ?? props.light ?? Colors[colorName];
}
