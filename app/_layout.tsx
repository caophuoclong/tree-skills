import {
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from "@expo-google-fonts/space-mono";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppState, Text, View } from "react-native";
import "react-native-reanimated";

// Enable network mocks in development
if (__DEV__) {
  require("@/src/business-logic/api/mock").setupNetworkMocks();
}

import { queryClient } from "@/src/business-logic/api/query-client";
import { useNotificationStore } from "@/src/business-logic/stores/notificationStore";
import { useUserStore } from "@/src/business-logic/stores/userStore";
import { LevelUpModal, LoginBonusModal } from "@/src/ui/molecules";
import { useTheme } from "@/src/ui/tokens";
import { useEffect } from "react";

// ─── Global font defaults ────────────────────────────────────────────────────
// Patch every React Native Text so Space Grotesk is the base font.
// Components that need Bold/SemiBold set fontFamily explicitly in their styles.
//
// fontWeight → fontFamily mapping for Space Grotesk:
//   '400' / 'normal' → SpaceGrotesk-Regular
//   '500'            → SpaceGrotesk-Medium
//   '600'            → SpaceGrotesk-SemiBold
//   '700' / 'bold'   → SpaceGrotesk-Bold
//
// NOTE: On iOS, custom fonts IGNORE fontWeight — you must set fontFamily to
// the correct weight variant explicitly. This default sets the Regular base;
// individual components override it by setting fontFamily themselves.

(Text as any).defaultProps = (Text as any).defaultProps ?? {};

(Text as any).defaultProps.style = { fontFamily: "SpaceGrotesk-Regular" };

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const { isDark, colors } = useTheme();
  const checkDailyLogin = useUserStore((s) => s.checkDailyLogin);
  const { user } = useUserStore();
  const { addNotification } = useNotificationStore();

  const [fontsLoaded] = useFonts({
    "SpaceGrotesk-Light": SpaceGrotesk_300Light,
    "SpaceGrotesk-Regular": SpaceGrotesk_400Regular,
    "SpaceGrotesk-Medium": SpaceGrotesk_500Medium,
    "SpaceGrotesk-SemiBold": SpaceGrotesk_600SemiBold,
    "SpaceGrotesk-Bold": SpaceGrotesk_700Bold,
    "SpaceMono-Regular": SpaceMono_400Regular,
    "SpaceMono-Bold": SpaceMono_700Bold,
  });

  // ── E2: Daily login bonus ──────────────────────────────────────────────────
  // Fire once after fonts are ready, and again whenever the app foregrounds.
  // checkDailyLogin is idempotent — only triggers reward when date changes.
  useEffect(() => {
    if (!fontsLoaded) return;
    checkDailyLogin();
    const sub = AppState.addEventListener("change", (appState) => {
      if (appState === "active") {
        checkDailyLogin();

        // ── E7: Generate notifications ───────────────────────────────────────
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .split("T")[0];
        const lastLoginDate = user?.last_login_at?.split("T")[0];

        // Streak reminder: if streak exists and last login was yesterday
        if (user?.streak && user.streak > 0 && lastLoginDate === yesterday) {
          addNotification({
            type: "streak",
            title: "🔥 Keep your streak!",
            body: `Don't break your ${user.streak}-day streak! Complete a quest today.`,
            targetRoute: "/(tabs)/quests",
          });
        }

        // Quest suggestion: if no quests completed yet today
        // (This would need dailyStats from userStore if available)
        // For now, we'll just add it once per session
        const lastSuggestion = sessionStorage?.getItem?.("lastQuestSuggestion");
        if (!lastSuggestion || lastSuggestion !== today) {
          addNotification({
            type: "suggestion",
            title: "💡 Start your day",
            body: "Try a 5-min quest to kick off your learning session.",
            targetRoute: "/(tabs)/quests",
          });
          sessionStorage?.setItem?.("lastQuestSuggestion", today);
        }
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsLoaded]);

  // Hold render until fonts are loaded to prevent flash of unstyled text
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bgBase }} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="branch/[id]" />
        <Stack.Screen name="quest/[id]" options={{ presentation: "modal" }} />
        <Stack.Screen name="leaderboard" />
        <Stack.Screen name="wellbeing" />
        <Stack.Screen name="settings" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="skill-builder"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="notifications"
          options={{ presentation: "modal", animation: "slide_from_left" }}
        />
        <Stack.Screen
          name="node-detail"
          options={{
            presentation: "transparentModal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack>
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor={colors.bgBase}
      />
      <LevelUpModal />
      <LoginBonusModal />
    </QueryClientProvider>
  );
}
