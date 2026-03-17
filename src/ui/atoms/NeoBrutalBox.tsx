/**
 * NeoBrutalBox — Neobrutalism wrapper component for React Native
 *
 * WHY not use shadowColor/shadowOffset/elevation:
 *   - Native shadow renders on the View itself and visually bleeds through child content
 *   - elevation on Android adds a system-level drop shadow that can't be "hard-offset"
 *   - Both are blurred/soft by nature — neobrutalism needs a SOLID, sharp offset shadow
 *
 * HOW we fake it:
 *   ┌─────────────────────────┐  ← outer View (padding-right + padding-bottom = shadow size)
 *   │  ░░░░░░░░░░░░░░░░░░░░   │  ← shadow: absolute View, offset by (dx, dy), solid color
 *   │  ┌───────────────────┐  │  ← content: normal View with border + bg
 *   │  │   {children}      │  │
 *   │  └───────────────────┘  │
 *   └─────────────────────────┘
 *
 * Press interaction:
 *   - Content Animated.View translates → (shadowOffsetX, shadowOffsetY)
 *   - Shadow Animated.View fades out
 *   → Creates "push down into the surface" tactile illusion
 */

import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/src/ui/tokens';
import { Radius } from '@/src/ui/tokens/spacing';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NeoBrutalBoxProps {
  children: React.ReactNode;

  /** Horizontal shadow offset in px. Default: 4 */
  shadowOffsetX?: number;
  /** Vertical shadow offset in px. Default: 4 */
  shadowOffsetY?: number;
  /** Shadow color. Default: theme textPrimary (#000 light / #F4F4F5 dark) */
  shadowColor?: string;

  /** Border width. Default: 2 */
  borderWidth?: number;
  /** Border color. Default: theme textPrimary */
  borderColor?: string;

  /** Card background color. Default: theme bgSurface */
  backgroundColor?: string;
  /** Border radius. Default: Radius.md (12) */
  borderRadius?: number;

  /** Outer wrapper style — use for margin, width, flex */
  style?: ViewStyle;
  /** Inner content area style — use for padding */
  contentStyle?: ViewStyle;

  /** Press handler. When provided, component becomes interactive with push-down animation */
  onPress?: () => void;
  /** Long press handler */
  onLongPress?: () => void;

  /** Disable the press animation while keeping onPress (e.g. for custom animations) */
  disablePressAnimation?: boolean;

  testID?: string;
}

// ─── Spring config ─────────────────────────────────────────────────────────────

const PRESS_SPRING = {
  damping: 18,
  stiffness: 450,
  mass: 0.7,
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function NeoBrutalBox({
  children,
  shadowOffsetX = 4,
  shadowOffsetY = 4,
  shadowColor,
  borderWidth = 2,
  borderColor,
  backgroundColor,
  borderRadius = Radius.md,
  style,
  contentStyle,
  onPress,
  onLongPress,
  disablePressAnimation = false,
  testID,
}: NeoBrutalBoxProps) {
  const { colors } = useTheme();

  // Resolve colors with fallback to theme
  const resolvedShadowColor = shadowColor ?? colors.textPrimary;
  const resolvedBorderColor = borderColor ?? colors.textPrimary;
  const resolvedBgColor = backgroundColor ?? colors.bgSurface;

  // ── Animation ──────────────────────────────────────────────────────────────
  // 0 = rest, 1 = fully pressed
  const pressed = useSharedValue(0);

  const contentAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pressed.value * shadowOffsetX },
      { translateY: pressed.value * shadowOffsetY },
    ],
  }));

  const shadowAnimStyle = useAnimatedStyle(() => ({
    // Fade out as card "sinks into" the shadow
    opacity: 1 - pressed.value,
  }));

  // ── Press handlers ─────────────────────────────────────────────────────────
  const handlePressIn = useCallback(() => {
    if (!disablePressAnimation && onPress) {
      pressed.value = withSpring(1, PRESS_SPRING);
    }
  }, [disablePressAnimation, onPress, pressed]);

  const handlePressOut = useCallback(() => {
    if (!disablePressAnimation && onPress) {
      pressed.value = withSpring(0, PRESS_SPRING);
    }
  }, [disablePressAnimation, onPress, pressed]);

  // ── Layout math ────────────────────────────────────────────────────────────
  // The outer container adds right+bottom padding equal to the shadow offset.
  // This "reserves space" so the shadow doesn't push siblings around.
  //
  // Shadow layer: absolute, offset by (shadowOffsetX, shadowOffsetY), right+bottom=0
  //   → same W/H as content because content also has right/bottom inset via parent padding
  //
  // Visual:
  //   outer W = contentW + shadowOffsetX
  //   outer H = contentH + shadowOffsetY
  //   shadow: top=shadowOffsetY, left=shadowOffsetX, right=0, bottom=0
  //     → W = outerW - shadowOffsetX = contentW ✅
  //     → H = outerH - shadowOffsetY = contentH ✅

  const outerPad: ViewStyle = {
    paddingRight: shadowOffsetX,
    paddingBottom: shadowOffsetY,
  };

  const shadowAbsolute: ViewStyle = {
    position: 'absolute',
    top: shadowOffsetY,
    left: shadowOffsetX,
    right: 0,
    bottom: 0,
    backgroundColor: resolvedShadowColor,
    borderRadius,
  };

  const contentBase: ViewStyle = {
    backgroundColor: resolvedBgColor,
    borderWidth,
    borderColor: resolvedBorderColor,
    borderRadius,
    // overflow hidden so border-radius clips children properly
    // (safe: shadow is a sibling, NOT a child — won't be clipped)
    overflow: 'hidden',
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const inner = (
    <View style={[outerPad, style]} testID={testID}>
      {/* Shadow layer — renders BEHIND content */}
      <Animated.View
        style={[shadowAbsolute, shadowAnimStyle]}
        // Don't steal touches from content
        pointerEvents="none"
      />

      {/* Content layer — translates toward shadow on press */}
      <Animated.View style={[contentBase, contentAnimStyle]}>
        <View style={[styles.contentInner, contentStyle]}>{children}</View>
      </Animated.View>
    </View>
  );

  // Wrap in Pressable only when interactive
  if (onPress || onLongPress) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        // Let the animated View handle visual feedback — no default highlight
        android_ripple={null}
        style={styles.pressableReset}
      >
        {inner}
      </Pressable>
    );
  }

  return inner;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  pressableReset: {
    // Pressable adds no layout by default, but we reset just in case
  },
  contentInner: {
    // Default padding so content doesn't touch the border
    // Consumers can override via `contentStyle`
    padding: 0,
  },
});

// ─── Preset variants ──────────────────────────────────────────────────────────
//
// Convenience wrappers for common neobrutalism use-cases.
// Each maps to NeoBrutalBox with pre-set color props.

type VariantProps = Omit<NeoBrutalBoxProps, 'shadowColor' | 'borderColor' | 'backgroundColor'>;

/**
 * White card with black shadow/border — classic neobrutalism on light bg
 */
export function NeoBrutalCard(props: VariantProps) {
  return (
    <NeoBrutalBox
      shadowColor="#000000"
      borderColor="#000000"
      backgroundColor="#FFFFFF"
      {...props}
    />
  );
}

/**
 * Colored accent box — pass `accentColor` to set bg + matching border/shadow.
 * Great for CTA buttons, highlight cards.
 */
export interface NeoBrutalAccentProps extends VariantProps {
  accentColor: string;
  /** Shadow/border color — defaults to #000 */
  strokeColor?: string;
}

export function NeoBrutalAccent({
  accentColor,
  strokeColor = '#000000',
  ...rest
}: NeoBrutalAccentProps) {
  return (
    <NeoBrutalBox
      backgroundColor={accentColor}
      borderColor={strokeColor}
      shadowColor={strokeColor}
      {...rest}
    />
  );
}

/**
 * Theme-aware variant: adapts to dark/light mode automatically.
 * Dark mode: dark bg + colored border/shadow
 * Light mode: white bg + black border/shadow
 */
export function NeoBrutalThemed(props: VariantProps) {
  // Uses NeoBrutalBox defaults which already resolve via useTheme()
  return <NeoBrutalBox {...props} />;
}
