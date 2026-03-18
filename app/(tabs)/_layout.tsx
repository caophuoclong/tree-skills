import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Foundation from "@expo/vector-icons/Foundation";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/ui/tokens";

// ─── Tab definitions (keeps icon/label co-located with routes) ───────────────
const TAB_META: Record<
  string,
  {
    label: string;
    icon: (color: string, size: number) => React.ReactNode;
  }
> = {
  index: {
    label: "Trang chủ",
    icon: (c, s) => <Foundation name="home" size={s} color={c} />,
  },
  tree: {
    label: "Kỹ năng",
    icon: (c, s) => <FontAwesome6 name="code-branch" size={s} color={c} />,
  },
  quests: {
    label: "Nhiệm vụ",
    icon: (c, s) => (
      <Ionicons name="checkmark-done-circle-sharp" size={s} color={c} />
    ),
  },
  profile: {
    label: "Cá nhân",
    icon: (c, s) => <FontAwesome6 name="user-large" size={s} color={c} />,
  },
};

const VISIBLE_TABS = Object.keys(TAB_META); // excludes fab-placeholder

// ─── Floating Nav Bar ─────────────────────────────────────────────────────────
function FloatingNavBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [showAll, setShowAll] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Track last 2 visited routes (excluding fab-placeholder)
  const [history, setHistory] = useState<string[]>(["index", "tree"]);

  const currentRoute = state.routes[state.index]?.name ?? "index";

  useEffect(() => {
    if (!VISIBLE_TABS.includes(currentRoute)) return;
    setHistory((prev) => {
      const next = [currentRoute, ...prev.filter((r) => r !== currentRoute)];
      return next.slice(0, 2);
    });
  }, [currentRoute]);

  // Animate the "show all" panel
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: showAll ? 1 : 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 260,
      mass: 0.8,
    }).start();
  }, [showAll, scaleAnim]);

  const navigate = (routeName: string) => {
    const route = state.routes.find((r) => r.name === routeName);
    if (!route) return;
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) navigation.navigate(routeName);
  };

  // 2 items to display in the bar
  const displayItems = history.map((name) => ({
    name,
    meta: TAB_META[name],
    active: currentRoute === name,
  }));

  const bottomOffset = Math.max(insets.bottom, 16);

  return (
    <>
      {/* ── "Show All" popup ────────────────────────────────────────────── */}
      <Modal
        visible={showAll}
        transparent
        animationType="none"
        onRequestClose={() => setShowAll(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.allOverlay} onPress={() => setShowAll(false)}>
          <Animated.View
            style={[
              styles.allPanelWrap,
              { bottom: bottomOffset + 72 + 12, left: 16 },
              {
                opacity: scaleAnim,
                transform: [
                  {
                    translateY: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                  {
                    scale: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.92, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* 
            intensity        → 0 (trong) ──── 85 ──── 100 (mờ tối đa)

            tint             → "systemUltraThinMaterial"  sáng, mỏng  ← hiện tại
                              "systemMaterial"           trung bình
                              "dark"                     tối
                              "light"                    trắng rõ

            backgroundColor  → rgba(255,255,255, X)  tăng X = sáng hơn
                              rgba(0,0,0, X)        tăng X = tối hơn

            borderColor      → rgba(255,255,255, X)  tăng X = viền rõ hơn

            borderRadius     → 28 (pill) ←  giảm = vuông hơn

            shadowOpacity    → 0.3 ← tăng = bóng đậm, giảm = nhẹ
            shadowRadius     → 24  ← tăng = bóng loang rộng

            position         → left: 16   bottom-left ← hiện tại
                              right: 16  bottom-right

            */}
            <BlurView
              intensity={80}
              tint="systemUltraThinMaterial"
              style={[
                styles.allPanel,
                {
                  borderColor: "rgba(255,255,255,0.18)",
                  backgroundColor: "rgba(255,255,255,0.10)",
                  shadowColor: "#00000060",
                },
              ]}
            >
              <Text style={[styles.allTitle, { color: colors.textMuted }]}>
                TẤT CẢ MÀN HÌNH
              </Text>
              {VISIBLE_TABS.map((name) => {
                const meta = TAB_META[name];
                const active = currentRoute === name;
                const col = active ? colors.brandPrimary : colors.textSecondary;
                return (
                  <TouchableOpacity
                    key={name}
                    style={[
                      styles.allItem,
                      active && {
                        backgroundColor: `${colors.brandPrimary}18`,
                        borderRadius: 14,
                      },
                    ]}
                    onPress={() => {
                      setShowAll(false);
                      navigate(name);
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.allIconWrap,
                        { backgroundColor: `${col}18` },
                      ]}
                    >
                      {meta.icon(col, 20)}
                    </View>
                    <Text style={[styles.allLabel, { color: col }]}>
                      {meta.label}
                    </Text>
                    {active && (
                      <View
                        style={[
                          styles.activeDot,
                          { backgroundColor: colors.brandPrimary },
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </BlurView>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* ── Floating bar ────────────────────────────────────────────────── */}
      {/*
       * ┌─────────────────────────────────────────────────────────────┐
       * │  APPEARANCE TUNING — chỉnh tại đây                          │
       * ├─────────────────────────────────────────────────────────────┤
       * │  intensity   : 0–100                                        │
       * │    0   = hoàn toàn trong suốt (không blur)                  │
       * │    50  = blur nhẹ, nhìn thấy nền rõ                         │
       * │    85  = blur mạnh, frosted glass ← hiện tại                │
       * │    100 = mờ tối đa                                          │
       * │                                                              │
       * │  tint options (iOS):                                        │
       * │    "light"                    → tint trắng rõ               │
       * │    "dark"                     → tint đen, tối               │
       * │    "default"                  → theo system theme           │
       * │    "systemUltraThinMaterial"  → mỏng nhất, sáng ← hiện tại │
       * │    "systemThinMaterial"       → mỏng vừa                   │
       * │    "systemMaterial"           → dày vừa, đục hơn           │
       * │    "systemThickMaterial"      → dày nhất, gần như đục      │
       * │    "systemUltraThinMaterialDark" → ultra thin nhưng tối    │
       * │    "systemMaterialDark"          → dark + đục vừa          │
       * │                                                              │
       * │  backgroundColor overlay:                                   │
       * │    "rgba(255,255,255,0.05)"  → trắng rất nhẹ               │
       * │    "rgba(255,255,255,0.10)"  → trắng nhẹ ← hiện tại        │
       * │    "rgba(255,255,255,0.20)"  → trắng rõ hơn, sáng hơn      │
       * │    "rgba(0,0,0,0.30)"        → dark overlay, tối lại        │
       * │                                                              │
       * │  borderColor:                                               │
       * │    "rgba(255,255,255,0.10)"  → viền mờ                     │
       * │    "rgba(255,255,255,0.18)"  → viền vừa ← hiện tại         │
       * │    "rgba(255,255,255,0.30)"  → viền sáng rõ                │
       * └─────────────────────────────────────────────────────────────┘
       */}
      <View
        style={[styles.floatWrap, { bottom: bottomOffset, left: 16 }]}
        pointerEvents="box-none"
      >
        <BlurView
          intensity={85} // ← tăng = mờ hơn, giảm = trong hơn
          tint="systemUltraThinMaterial" // ← xem bảng tint options ở trên
          style={[
            styles.glass,
            {
              borderColor: "rgba(255,255,255,0.18)", // ← độ sáng viền
              backgroundColor: "rgba(255,255,255,0.10)", // ← overlay màu nền
              shadowColor: "#000",
            },
          ]}
        >
          {/* 2 recent items */}
          {displayItems.map(({ name, meta, active }) => {
            const col = active ? colors.brandPrimary : colors.textSecondary;
            return (
              <TouchableOpacity
                key={name}
                style={[
                  styles.navItem,
                  active && {
                    backgroundColor: `${colors.brandPrimary}20`,
                    borderRadius: 20,
                  },
                ]}
                onPress={() => navigate(name)}
                activeOpacity={0.75}
              >
                {meta.icon(col, 20)}
                <Text
                  style={[
                    styles.navLabel,
                    { color: col },
                    active && { fontWeight: "700" },
                  ]}
                >
                  {meta.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Divider */}
          <View
            style={[styles.divider, { backgroundColor: colors.glassBorder }]}
          />

          {/* "···" show all button */}
          <TouchableOpacity
            style={styles.moreBtn}
            onPress={() => setShowAll(true)}
            activeOpacity={0.75}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </BlurView>
      </View>
    </>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function TabLayout() {
  const renderTabBar = useMemo(() => {
    const TabBar = (props: BottomTabBarProps) => <FloatingNavBar {...props} />;
    TabBar.displayName = "TabBar";
    return TabBar;
  }, []);

  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Trang chủ" }} />
      <Tabs.Screen name="tree" options={{ title: "Kỹ năng" }} />
      <Tabs.Screen name="quests" options={{ title: "Nhiệm vụ" }} />
      <Tabs.Screen name="profile" options={{ title: "Cá nhân" }} />
      {/* fab-placeholder kept to avoid 404, hidden from nav */}
      <Tabs.Screen name="fab-placeholder" options={{ href: null, title: "" }} />
    </Tabs>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ─── Floating bar ───────────────────────────────────────────────────────────
  floatWrap: {
    position: "absolute",
    zIndex: 999,
    // Vị trí thanh:
    //   bottom + left được set inline qua bottomOffset (safe area)
    //   Muốn canh giữa: thay left=16 bằng alignSelf="center" + left/right tự tính
    //   Muốn bottom-right: đổi left → right: 16
  },
  glass: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 28, // ← tăng = tròn hơn, 0 = vuông góc
    borderWidth: 1,
    gap: 2,
    overflow: "hidden", // bắt buộc để BlurView bo tròn đúng
    // Shadow — tạo cảm giác float
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 }, // ← height: đổ bóng xuống bao xa
        shadowOpacity: 0.3, // ← 0.0 = không bóng, 1.0 = bóng đậm
        shadowRadius: 24, // ← bóng lan rộng bao nhiêu px
      },
      android: { elevation: 16 }, // ← Android: chỉ có 1 giá trị này
    }),
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  divider: {
    width: 1,
    height: 24,
    marginHorizontal: 4,
    opacity: 0.5,
  },
  moreBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  // Show-all popup
  allOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  allPanelWrap: {
    position: "absolute",
    width: 220,
  },
  allPanel: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    paddingVertical: 8,
    paddingHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 28,
      },
      android: { elevation: 20 },
    }),
  },
  allTitle: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingVertical: 6,
    opacity: 0.6,
  },
  allItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  allIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  allLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
