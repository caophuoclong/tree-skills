import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Foundation from "@expo/vector-icons/Foundation";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
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
              {/* NB hard shadow behind panel */}
            <View
              style={[
                styles.allPanelShadow,
                { backgroundColor: colors.textPrimary },
              ]}
            />
            {/* NB panel */}
            <View
              style={[
                styles.allPanel,
                {
                  backgroundColor: colors.bgElevated,
                  borderColor: colors.textPrimary,
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
                        backgroundColor: `${colors.brandPrimary}20`,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor: colors.brandPrimary,
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
                        {
                          backgroundColor: `${col}20`,
                          borderWidth: 1.5,
                          borderColor: col,
                        },
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
            </View>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* ── Floating NB bar ─────────────────────────────────────────────── */}
      <View
        style={[styles.floatWrap, { bottom: bottomOffset, left: 16 }]}
        pointerEvents="box-none"
      >
        {/* Hard-offset shadow layer */}
        <View
          style={[
            styles.nbBarShadow,
            { backgroundColor: colors.textPrimary },
          ]}
        />
        {/* NB bar content */}
        <View
          style={[
            styles.nbBar,
            {
              backgroundColor: colors.bgElevated,
              borderColor: colors.textPrimary,
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
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: colors.brandPrimary,
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
            style={[styles.divider, { backgroundColor: colors.textPrimary }]}
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
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
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
// NB shadow offset — shared constant
const NB_SHADOW = 4;
const NB_RADIUS = 14; // less pill-y than glass (was 28), more blocky NB feel

const styles = StyleSheet.create({
  // ─── Floating NB bar ────────────────────────────────────────────────────────
  floatWrap: {
    position: "absolute",
    zIndex: 999,
    // Reserve space for hard shadow so it doesn't get clipped
    paddingRight: NB_SHADOW,
    paddingBottom: NB_SHADOW,
  },
  // Hard shadow: absolute layer offset by NB_SHADOW, same shape as bar
  nbBarShadow: {
    position: "absolute",
    top: NB_SHADOW,
    left: NB_SHADOW,
    right: 0,
    bottom: 0,
    borderRadius: NB_RADIUS,
  },
  // The actual NB bar
  nbBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: NB_RADIUS,
    borderWidth: 2,
    gap: 2,
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
    width: 1.5,
    height: 24,
    marginHorizontal: 4,
    opacity: 0.4,
  },
  moreBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  // ─── Show-all NB popup ──────────────────────────────────────────────────────
  allOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  allPanelWrap: {
    position: "absolute",
    width: 220,
    // Reserve space for shadow
    paddingRight: NB_SHADOW,
    paddingBottom: NB_SHADOW,
  },
  // Hard shadow behind the popup panel
  allPanelShadow: {
    position: "absolute",
    top: NB_SHADOW,
    left: NB_SHADOW,
    right: 0,
    bottom: 0,
    borderRadius: NB_RADIUS,
  },
  allPanel: {
    borderRadius: NB_RADIUS,
    borderWidth: 2,
    overflow: "hidden",
    paddingVertical: 8,
    paddingHorizontal: 4,
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
    borderRadius: 10,
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
