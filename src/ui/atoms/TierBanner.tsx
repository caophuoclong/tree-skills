import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Emoji, NeoBrutalAccent } from "@/src/ui/atoms";

const HEADER_H = 64;

const TIER_LABEL: Record<number, string> = {
  1: "NỀN TẢNG",
  2: "TRUNG CẤP",
  3: "NÂNG CAO",
};

const TIER_ICON: Record<number, string> = { 1: "🌱", 2: "⚡", 3: "🔥" };

interface Banner {
  tier: number;
  label: string;
  y: number;
}

interface TierBannerViewProps {
  banner: Banner;
  branchColor: string;
  colors: any;
}

export function TierBannerView({
  banner,
  branchColor,
  colors,
}: TierBannerViewProps) {
  return (
    <View
      pointerEvents="none"
      style={[styles.bannerWrap, { top: banner.y, height: HEADER_H }]}
    >
      <NeoBrutalAccent
        accentColor={branchColor}
        strokeColor="#000"
        borderWidth={1.5}
        borderRadius={9999}
      >
        <View style={[styles.bannerPill]}>
          <Emoji size={12}>{TIER_ICON[banner.tier] ?? ""}</Emoji>
          <Text style={[styles.bannerText, { color: "#fff" }]}>
            {banner.label}
          </Text>
        </View>
      </NeoBrutalAccent>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  bannerText: {
    fontSize: 10,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
});

export type { Banner };
