/**
 * ProgressRing — NB circular progress indicator
 *
 * Uses react-native-svg to draw a hard-offset disc shadow (NB signature)
 * + a track ring + a progress arc (butt cap for blocky NB feel).
 * Arc starts from top via rotate(-90°) transform.
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/src/ui/tokens';

// ─── Ring geometry constants ──────────────────────────────────────────────────
const DISC      = 62;          // outer circle diameter (px)
const SHADOW_OFF = 4;          // hard-shadow offset (px)
const SVG_SIZE  = DISC + SHADOW_OFF; // reserves space so shadow doesn't clip
const CX        = DISC / 2;   // disc centre in SVG coords
const CY        = DISC / 2;
const STROKE_W  = 8;           // arc stroke width
const BORDER_W  = 2;           // disc border width
const ARC_R     = DISC / 2 - STROKE_W / 2 - BORDER_W;
const CIRC      = 2 * Math.PI * ARC_R;

export interface ProgressRingProps {
  percent: number;
  color: string;
  label: string;
}

export function ProgressRing({ percent, color, label }: ProgressRingProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const clamp = Math.min(100, Math.max(0, percent));
  const dash   = (clamp / 100) * CIRC;

  return (
    <View style={styles.wrapper}>
      <View style={{ width: SVG_SIZE, height: SVG_SIZE }}>
        <Svg width={SVG_SIZE} height={SVG_SIZE}>
          {/* ① Hard-shadow disc — NB signature offset */}
          <Circle
            cx={CX + SHADOW_OFF}
            cy={CY + SHADOW_OFF}
            r={DISC / 2}
            fill={color}
            opacity={0.4}
          />
          {/* ② Main disc */}
          <Circle
            cx={CX}
            cy={CY}
            r={DISC / 2 - BORDER_W / 2}
            fill={colors.bgElevated}
            stroke={color}
            strokeWidth={BORDER_W}
          />
          {/* ③ Track ring */}
          <Circle
            cx={CX}
            cy={CY}
            r={ARC_R}
            fill="none"
            stroke={`${color}28`}
            strokeWidth={STROKE_W}
          />
          {/* ④ Progress arc — butt cap, starts from top */}
          {clamp > 0 && (
            <Circle
              cx={CX}
              cy={CY}
              r={ARC_R}
              fill="none"
              stroke={color}
              strokeWidth={STROKE_W}
              strokeDasharray={`${dash} ${CIRC - dash}`}
              strokeLinecap="butt"
              transform={`rotate(-90 ${CX} ${CY})`}
            />
          )}
        </Svg>
        {/* ⑤ % label centred over disc (not shadow) */}
        <View pointerEvents="none" style={styles.labelOverlay}>
          <Text style={[styles.percent, { color }]}>{clamp}%</Text>
        </View>
      </View>
      <Text style={styles.ringLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    wrapper: {
      alignItems: 'center',
      gap: 6,
    },
    labelOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: DISC,
      height: DISC,
      alignItems: 'center',
      justifyContent: 'center',
    },
    percent: {
      fontSize: 12,
      fontFamily: 'SpaceGrotesk-Bold',
      fontWeight: '700',
    },
    ringLabel: {
      fontSize: 11,
      fontFamily: 'SpaceGrotesk-Medium',
      fontWeight: '500',
      color: colors.textSecondary,
      maxWidth: SVG_SIZE,
      textAlign: 'center',
    },
  });
