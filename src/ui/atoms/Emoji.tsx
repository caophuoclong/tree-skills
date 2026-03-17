import React from "react";
import { Platform, Text, TextStyle } from "react-native";

/**
 * Emoji — render emoji đúng trên cả iOS & Android.
 *
 * Vấn đề: StyleSheet.create với fontFamily: undefined không thực sự
 * reset font trên iOS — cần dùng Platform.select với tên font hệ thống.
 *
 * iOS  → 'System' = SF Pro Display, có emoji fallback sang Apple Color Emoji
 * Android → 'sans-serif' = Noto Sans, có Noto Emoji fallback
 *
 * KHÔNG dùng StyleSheet.create vì undefined values bị xử lý khác nhau
 * tuỳ theo platform và RN version.
 *
 * @example
 * <Emoji size={20}>🔥</Emoji>
 *
 * // inline trong Text/AppText
 * <Text>Streak <Emoji size={14}>🔥</Emoji> {days} ngày</Text>
 */

interface EmojiProps {
  /** Emoji character(s) to render */
  children: string;
  /** Font size (default: 16) */
  size?: number;
  /** Additional TextStyle overrides */
  style?: TextStyle;
}

// Resolved once at module load — no re-computation per render
const SYSTEM_FONT = Platform.select({
  ios: "System",       // SF Pro → fallback chain includes Apple Color Emoji
  android: "sans-serif", // Noto Sans → fallback chain includes Noto Emoji
  default: undefined,
});

export const Emoji = ({ children, size = 16, style }: EmojiProps) => (
  <Text
    style={[
      {
        fontFamily: SYSTEM_FONT,
        // Do NOT set lineHeight — it clips emoji on Android
        fontSize: size,
      },
      style,
    ]}
  >
    {children}
  </Text>
);
