/**
 * NeoBrutalism ASCII-face icon set.
 *
 * Each icon is a square SVG with:
 *   - Hard offset shadow (3px down-right, dark fill)
 *   - Flat colour fill + 3px black border
 *   - ASCII-face expression built from SVG primitives
 *
 * Props:
 *   size  — icon width/height in dp (default 32)
 *   color — override the face fill colour
 *
 * Streak flame icons:
 *   streak — number of streak days, used to pick flame level automatically
 *   level  — override flame level directly (0–5)
 *   Flame levels:
 *     0  no flame     (< 3 days)
 *     1  tiny spark   (3–6 days)   #F97316
 *     2  small flame  (7–13 days)  #EF4444
 *     3  flame        (14–29 days) #DC2626
 *     4  big flame    (30–59 days) #B91C1C + yellow core
 *     5  legendary    (60+ days)   multi-color inferno
 */
import React from "react";
import Svg, { Circle, Defs, Ellipse, Line, Path, RadialGradient, Rect, Stop, Text } from "react-native-svg";

interface FaceIconProps {
  size?: number;
  color?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// STREAK FLAME ICONS
// ─────────────────────────────────────────────────────────────────────────────

export type FlameLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** Derive flame level from raw streak day count (matches STREAK_MILESTONES). */
export function getFlameLevel(streak: number): FlameLevel {
  if (streak >= 60) return 5;
  if (streak >= 30) return 4;
  if (streak >= 14) return 3;
  if (streak >= 7)  return 2;
  if (streak >= 3)  return 1;
  return 0;
}

interface StreakFlameFaceProps {
  /** Raw streak count — auto-derives level. Takes precedence over `level`. */
  streak?: number;
  /** Override flame level directly (0–5). */
  level?: FlameLevel;
  size?: number;
}

const FLAME_CONFIG: Record<
  FlameLevel,
  { bg: string; flameOuter: string; flameInner: string | null; flameH: number }
> = {
  0: { bg: "#F5F5F5", flameOuter: "transparent", flameInner: null, flameH: 0 },
  1: { bg: "#FEF3C7", flameOuter: "#F97316", flameInner: null,    flameH: 4 },
  2: { bg: "#FEE2E2", flameOuter: "#EF4444", flameInner: null,    flameH: 6 },
  3: { bg: "#FCA5A5", flameOuter: "#DC2626", flameInner: "#F97316", flameH: 8 },
  4: { bg: "#F87171", flameOuter: "#B91C1C", flameInner: "#FBBF24", flameH: 10 },
  5: { bg: "#EF4444", flameOuter: "#7F1D1D", flameInner: "#FDE68A", flameH: 12 },
};

/**
 * Small SVG flame shape centred at (cx, baseY).
 * The flame tip points upward from baseY by `h` units.
 */
function Flame({
  cx,
  baseY,
  h,
  outer,
  inner,
}: {
  cx: number;
  baseY: number;
  h: number;
  outer: string;
  inner: string | null;
}) {
  if (h === 0) return null;
  const w = h * 0.7;
  // Outer flame path: rounded teardrop pointing up
  const outerPath = `
    M ${cx} ${baseY - h}
    C ${cx + w * 0.2} ${baseY - h * 0.6}
      ${cx + w * 0.5} ${baseY - h * 0.3}
      ${cx + w * 0.4} ${baseY}
    Q ${cx} ${baseY + h * 0.15}
      ${cx - w * 0.4} ${baseY}
    C ${cx - w * 0.5} ${baseY - h * 0.3}
      ${cx - w * 0.2} ${baseY - h * 0.6}
      ${cx} ${baseY - h}
    Z
  `;
  // Inner brighter core (shorter)
  const ih = h * 0.5;
  const iw = ih * 0.55;
  const innerPath = `
    M ${cx} ${baseY - ih}
    C ${cx + iw * 0.2} ${baseY - ih * 0.6}
      ${cx + iw * 0.45} ${baseY - ih * 0.3}
      ${cx + iw * 0.35} ${baseY}
    Q ${cx} ${baseY + ih * 0.1}
      ${cx - iw * 0.35} ${baseY}
    C ${cx - iw * 0.45} ${baseY - ih * 0.3}
      ${cx - iw * 0.2} ${baseY - ih * 0.6}
      ${cx} ${baseY - ih}
    Z
  `;

  return (
    <>
      <Path d={outerPath} fill={outer} />
      {inner && <Path d={innerPath} fill={inner} />}
    </>
  );
}

/**
 * StreakFlameIcon — a NeoBrutalism face with flame eyes that scale with streak level.
 *
 * ```tsx
 * <StreakFlameIcon streak={14} size={40} />
 * <StreakFlameIcon level={5} size={56} />
 * ```
 */
export function StreakFlameIcon({ streak, level, size = 32 }: StreakFlameFaceProps) {
  const resolvedLevel: FlameLevel = streak !== undefined ? getFlameLevel(streak) : (level ?? 0);
  const cfg = FLAME_CONFIG[resolvedLevel];

  const vb = 32;
  // Flame base sits just above the eye centre (y=14), shifts up as flame grows
  const flameBaseY = 15;
  const eyeY = flameBaseY + 1; // pupils sit just below flame base
  const eyeSize = resolvedLevel >= 3 ? 2 : 1.8;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${vb + SHADOW} ${vb + SHADOW}`}>
      {/* hard shadow */}
      <Rect x={SHADOW} y={SHADOW} width={vb} height={vb} fill={SHADOW_COLOR} rx={0} />
      {/* face square */}
      <Rect x={0} y={0} width={vb} height={vb} fill={cfg.bg} stroke={STROKE} strokeWidth={BORDER} rx={0} />

      {/* left flame */}
      <Flame cx={10.5} baseY={flameBaseY} h={cfg.flameH} outer={cfg.flameOuter} inner={cfg.flameInner} />
      {/* right flame */}
      <Flame cx={21.5} baseY={flameBaseY} h={cfg.flameH} outer={cfg.flameOuter} inner={cfg.flameInner} />

      {/* left eye pupil (black dot, sits at flame base) */}
      <Circle cx={10.5} cy={eyeY} r={eyeSize} fill={STROKE} />
      {/* right eye pupil */}
      <Circle cx={21.5} cy={eyeY} r={eyeSize} fill={STROKE} />

      {/* mouth: more excited at higher levels */}
      {resolvedLevel <= 1 && (
        <Line x1="11" y1="23" x2="21" y2="23" stroke={STROKE} strokeWidth={2} strokeLinecap="round" />
      )}
      {resolvedLevel === 2 && (
        <Path d="M11 22 Q16 25 21 22" stroke={STROKE} strokeWidth={2} fill="none" strokeLinecap="round" />
      )}
      {resolvedLevel === 3 && (
        <Path d="M10 21 Q16 26 22 21" stroke={STROKE} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      )}
      {resolvedLevel >= 4 && (
        // wide open excited mouth
        <Path d="M10 20 Q16 28 22 20" stroke={STROKE} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      )}

      {/* level 5: extra side sparks */}
      {resolvedLevel === 5 && (
        <>
          <Flame cx={4}  baseY={18} h={5} outer="#F97316" inner="#FBBF24" />
          <Flame cx={28} baseY={18} h={5} outer="#F97316" inner="#FBBF24" />
        </>
      )}
    </Svg>
  );
}

// ─── shared constants ────────────────────────────────────────────────────────
const BORDER = 3;
const SHADOW = 3;
const SHADOW_COLOR = "#111";
const STROKE = "#000";

/** Renders the square frame (shadow + fill rect). `inner` is the viewBox size. */
function Frame({
  size,
  fill,
  children,
}: {
  size: number;
  fill: string;
  children: React.ReactNode;
}) {
  const vb = 32; // internal coordinate space always 32×32
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${vb + SHADOW} ${vb + SHADOW}`}>
      {/* hard shadow */}
      <Rect
        x={SHADOW}
        y={SHADOW}
        width={vb}
        height={vb}
        fill={SHADOW_COLOR}
        rx={0}
      />
      {/* main square */}
      <Rect
        x={0}
        y={0}
        width={vb}
        height={vb}
        fill={fill}
        stroke={STROKE}
        strokeWidth={BORDER}
        rx={0}
      />
      {children}
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MISC / GENERAL
// ─────────────────────────────────────────────────────────────────────────────

/** -_-  Home face (sleepy/calm) */
export function HomeFaceIcon({ size = 32, color = "#F5F5F5" }: FaceIconProps) {
  return (
    <Frame size={size} fill={color}>
      {/* left eye: dash */}
      <Line x1="8" y1="13" x2="13" y2="13" stroke={STROKE} strokeWidth={2.5} strokeLinecap="round" />
      {/* right eye: dash */}
      <Line x1="19" y1="13" x2="24" y2="13" stroke={STROKE} strokeWidth={2.5} strokeLinecap="round" />
      {/* mouth: flat line */}
      <Line x1="11" y1="21" x2="21" y2="21" stroke={STROKE} strokeWidth={2} strokeLinecap="round" />
    </Frame>
  );
}

/** >_<  Quest face (determined / challenge) */
export function QuestFaceIcon({ size = 32, color = "#FFE066" }: FaceIconProps) {
  return (
    <Frame size={size} fill={color}>
      {/* left eye: > shape */}
      <Path d="M8 11 L13 13 L8 15" stroke={STROKE} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* right eye: < shape */}
      <Path d="M24 11 L19 13 L24 15" stroke={STROKE} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* mouth: flat */}
      <Line x1="11" y1="21" x2="21" y2="21" stroke={STROKE} strokeWidth={2} strokeLinecap="round" />
    </Frame>
  );
}

/** o_o  Tree face (wide-eyed / curious) */
export function TreeFaceIcon({ size = 32, color = "#B8FF65" }: FaceIconProps) {
  return (
    <Frame size={size} fill={color}>
      {/* left eye: small circle */}
      <Circle cx="10.5" cy="13" r="2.5" fill={STROKE} />
      {/* right eye: small circle */}
      <Circle cx="21.5" cy="13" r="2.5" fill={STROKE} />
      {/* mouth: straight */}
      <Line x1="11" y1="21" x2="21" y2="21" stroke={STROKE} strokeWidth={2} strokeLinecap="round" />
    </Frame>
  );
}

/** ._.  Profile face (dotted / gentle) */
export function ProfileFaceIcon({ size = 32, color = "#C4B5FD" }: FaceIconProps) {
  return (
    <Frame size={size} fill={color}>
      {/* left eye: tiny dot */}
      <Circle cx="10.5" cy="13" r="1.5" fill={STROKE} />
      {/* right eye: tiny dot */}
      <Circle cx="21.5" cy="13" r="1.5" fill={STROKE} />
      {/* mouth: slight smile */}
      <Path d="M11 20 Q16 23 21 20" stroke={STROKE} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOOD
// ─────────────────────────────────────────────────────────────────────────────

/** -_- zzz  Exhausted */
export function ExhaustedIcon({ size = 32, color = "#D1D5DB" }: FaceIconProps) {
  return (
    <Frame size={size} fill={color}>
      {/* left eye */}
      <Line x1="7" y1="13" x2="12" y2="13" stroke={STROKE} strokeWidth={2.5} strokeLinecap="round" />
      {/* right eye */}
      <Line x1="18" y1="13" x2="23" y2="13" stroke={STROKE} strokeWidth={2.5} strokeLinecap="round" />
      {/* mouth: flat */}
      <Line x1="11" y1="21" x2="21" y2="21" stroke={STROKE} strokeWidth={2} strokeLinecap="round" />
      {/* zzz */}
      <Text x="24" y="9" fontSize="5" fill={STROKE} fontWeight="bold">z</Text>
      <Text x="26" y="6" fontSize="4" fill={STROKE} fontWeight="bold">z</Text>
    </Frame>
  );
}

/** -.-  Sad (one eye closed) */
export function SadIcon({ size = 32, color = "#93C5FD" }: FaceIconProps) {
  return (
    <Frame size={size} fill={color}>
      {/* left eye: dash */}
      <Line x1="8" y1="13" x2="13" y2="13" stroke={STROKE} strokeWidth={2.5} strokeLinecap="round" />
      {/* right eye: dot */}
      <Circle cx="21" cy="13" r="1.5" fill={STROKE} />
      {/* mouth: frown */}
      <Path d="M11 22 Q16 19 21 22" stroke={STROKE} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Frame>
  );
}

/** -_-  Neutral */
export function NeutralIcon({ size = 32, color = "#E5E7EB" }: FaceIconProps) {
  return (
    <Frame size={size} fill={color}>
      <Line x1="8" y1="13" x2="13" y2="13" stroke={STROKE} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1="19" y1="13" x2="24" y2="13" stroke={STROKE} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1="11" y1="21" x2="21" y2="21" stroke={STROKE} strokeWidth={2} strokeLinecap="round" />
    </Frame>
  );
}

/** ^_^  Happy */
export function HappyIcon({ size = 32, color = "#FFE066" }: FaceIconProps) {
  return (
    <Frame size={size} fill={color}>
      {/* left eye: arc ^  */}
      <Path d="M8 14 Q10.5 11 13 14" stroke={STROKE} strokeWidth={2} fill="none" strokeLinecap="round" />
      {/* right eye: arc ^ */}
      <Path d="M19 14 Q21.5 11 24 14" stroke={STROKE} strokeWidth={2} fill="none" strokeLinecap="round" />
      {/* mouth: big smile */}
      <Path d="M10 20 Q16 25 22 20" stroke={STROKE} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Frame>
  );
}

/** *_*  Fired Up (star eyes) */
export function FiredUpIcon({ size = 32, color = "#FF6B6B" }: FaceIconProps) {
  return (
    <Frame size={size} fill={color}>
      {/* left star eye */}
      <Path d="M10.5 11 L11.2 13.2 L13.5 13.2 L11.7 14.5 L12.4 16.7 L10.5 15.4 L8.6 16.7 L9.3 14.5 L7.5 13.2 L9.8 13.2 Z"
        fill={STROKE} />
      {/* right star eye */}
      <Path d="M21.5 11 L22.2 13.2 L24.5 13.2 L22.7 14.5 L23.4 16.7 L21.5 15.4 L19.6 16.7 L20.3 14.5 L18.5 13.2 L20.8 13.2 Z"
        fill={STROKE} />
      {/* mouth: big grin */}
      <Path d="M10 20 Q16 26 22 20" stroke={STROKE} strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS / GAME
// ─────────────────────────────────────────────────────────────────────────────

/** -w-  Streak (w-mouth = fire smirk) */
export function StreakFaceIcon({ size = 32, color = "#FDBA74" }: FaceIconProps) {
  return (
    <Frame size={size} fill={color}>
      <Line x1="8" y1="13" x2="13" y2="13" stroke={STROKE} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1="19" y1="13" x2="24" y2="13" stroke={STROKE} strokeWidth={2.5} strokeLinecap="round" />
      {/* w-mouth */}
      <Path d="M10 20 L13 23 L16 20 L19 23 L22 20" stroke={STROKE} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

/** O-O  XP Gain (big eyes, dash mouth) */
export function XPGainIcon({ size = 32, color = "#A7F3D0" }: FaceIconProps) {
  return (
    <Frame size={size} fill={color}>
      {/* left big eye */}
      <Circle cx="10.5" cy="13" r="3" fill="none" stroke={STROKE} strokeWidth={2} />
      <Circle cx="10.5" cy="13" r="1" fill={STROKE} />
      {/* right big eye */}
      <Circle cx="21.5" cy="13" r="3" fill="none" stroke={STROKE} strokeWidth={2} />
      <Circle cx="21.5" cy="13" r="1" fill={STROKE} />
      {/* dash bridge */}
      <Line x1="13.5" y1="13" x2="18.5" y2="13" stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
      {/* mouth */}
      <Path d="M11 21 Q16 24 21 21" stroke={STROKE} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Frame>
  );
}

/** x_x  Locked (crossed eyes) */
export function LockedIcon({ size = 32, color = "#F3F4F6" }: FaceIconProps) {
  return (
    <Frame size={size} fill={color}>
      {/* left eye: x */}
      <Line x1="8" y1="11" x2="13" y2="16" stroke={STROKE} strokeWidth={2} strokeLinecap="round" />
      <Line x1="13" y1="11" x2="8" y2="16" stroke={STROKE} strokeWidth={2} strokeLinecap="round" />
      {/* right eye: x */}
      <Line x1="19" y1="11" x2="24" y2="16" stroke={STROKE} strokeWidth={2} strokeLinecap="round" />
      <Line x1="24" y1="11" x2="19" y2="16" stroke={STROKE} strokeWidth={2} strokeLinecap="round" />
      {/* mouth: flat */}
      <Line x1="11" y1="22" x2="21" y2="22" stroke={STROKE} strokeWidth={2} strokeLinecap="round" />
    </Frame>
  );
}

/** ^u^  Complete (happy + u-mouth) */
export function CompleteIcon({ size = 32, color = "#B8FF65" }: FaceIconProps) {
  return (
    <Frame size={size} fill={color}>
      {/* left eye: ^ */}
      <Path d="M8 14 Q10.5 11 13 14" stroke={STROKE} strokeWidth={2} fill="none" strokeLinecap="round" />
      {/* right eye: ^ */}
      <Path d="M19 14 Q21.5 11 24 14" stroke={STROKE} strokeWidth={2} fill="none" strokeLinecap="round" />
      {/* u-mouth */}
      <Path d="M11 20 Q16 25 21 20" stroke={STROKE} strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </Frame>
  );
}

/** O_O  Warning (wide eyes + flat mouth) */
export function WarningIcon({ size = 32, color = "#FCA5A5" }: FaceIconProps) {
  return (
    <Frame size={size} fill={color}>
      {/* left big O eye */}
      <Circle cx="10.5" cy="13" r="3.5" fill="none" stroke={STROKE} strokeWidth={2.5} />
      <Circle cx="10.5" cy="13" r="1" fill={STROKE} />
      {/* right big O eye */}
      <Circle cx="21.5" cy="13" r="3.5" fill="none" stroke={STROKE} strokeWidth={2.5} />
      <Circle cx="21.5" cy="13" r="1" fill={STROKE} />
      {/* flat mouth */}
      <Line x1="11" y1="22" x2="21" y2="22" stroke={STROKE} strokeWidth={2} strokeLinecap="round" />
    </Frame>
  );
}

/** T_T  Grace Day (tears running down) */
export function GraceDayIcon({ size = 32, color = "#BAE6FD" }: FaceIconProps) {
  return (
    <Frame size={size} fill={color}>
      {/* left eye: T shape (tear) */}
      <Line x1="8" y1="12" x2="13" y2="12" stroke={STROKE} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1="10.5" y1="12" x2="10.5" y2="16" stroke={STROKE} strokeWidth={2} strokeLinecap="round" />
      {/* right eye: T shape */}
      <Line x1="19" y1="12" x2="24" y2="12" stroke={STROKE} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1="21.5" y1="12" x2="21.5" y2="16" stroke={STROKE} strokeWidth={2} strokeLinecap="round" />
      {/* mouth: sad */}
      <Path d="M11 23 Q16 20 21 23" stroke={STROKE} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Frame>
  );
}
