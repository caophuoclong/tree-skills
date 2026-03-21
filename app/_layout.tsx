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
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppState, Text, View } from "react-native";
import "react-native-reanimated";

import { queryClient } from "@/src/business-logic/api/query-client";
import { useAuth } from "@/src/business-logic/auth";
import { useAppData } from "@/src/business-logic/hooks/useAppData";
import { useNotificationStore } from "@/src/business-logic/stores/notificationStore";
import { useUserStore } from "@/src/business-logic/stores/userStore";
import { LevelUpModal, LoginBonusModal } from "@/src/ui/molecules";
import { useTheme } from "@/src/ui/tokens";
import { Fragment, useEffect, useRef } from "react";

// Network mocks are disabled — the app now uses Supabase directly.
// To re-enable local mocks: uncomment the block below.
// if (__DEV__) {
//   require("@/src/business-logic/api/mock").setupNetworkMocks();
// }

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

function App() {
  const { isDark, colors } = useTheme();
  const checkDailyLogin = useUserStore((s) => s.checkDailyLogin);
  const { user } = useUserStore();
  const { addNotification } = useNotificationStore();

  // Supabase auth — listens to session + syncs profile → userStore
  const { isAuthenticated } = useAuth();
  const { isAuthLoading } = useUserStore();

  // Fetch all app data from Supabase → Zustand stores
  const { isLoading: isDataLoading } = useAppData();

  const [fontsLoaded] = useFonts({
    "SpaceGrotesk-Light": SpaceGrotesk_300Light,
    "SpaceGrotesk-Regular": SpaceGrotesk_400Regular,
    "SpaceGrotesk-Medium": SpaceGrotesk_500Medium,
    "SpaceGrotesk-SemiBold": SpaceGrotesk_600SemiBold,
    "SpaceGrotesk-Bold": SpaceGrotesk_700Bold,
    "SpaceMono-Regular": SpaceMono_400Regular,
    "SpaceMono-Bold": SpaceMono_700Bold,
  });

  // Redirect to auth screen when not authenticated
  const hasRedirected = useRef(false);
  useEffect(() => {
    if (!fontsLoaded || isAuthLoading) return;
    if (isAuthenticated) {
      hasRedirected.current = false; // Reset when authenticated
    } else if (!hasRedirected.current) {
      hasRedirected.current = true;
      console.log("[App] Not authenticated — redirecting to welcome");
      router.replace("/(auth)/welcome");
    }
  }, [fontsLoaded, isAuthenticated, isAuthLoading]);

  // ── E2: Daily login bonus ──────────────────────────────────────────────────
  // Fire once after fonts are ready AND user is authenticated.
  // checkDailyLogin is idempotent — only triggers reward when date changes.
  useEffect(() => {
    if (!fontsLoaded || !isAuthenticated) return;
    checkDailyLogin();
    const sub = AppState.addEventListener("change", (appState) => {
      if (appState === "active" && isAuthenticated) {
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
  }, [fontsLoaded, isAuthenticated]);

  // Hold render until fonts are loaded to prevent flash of unstyled text
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bgBase }} />;
  }

  return (
    <Fragment>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="oauth/consent" options={{ animation: "none" }} />
        <Stack.Screen name="oauth/update-password" />
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
    </Fragment>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
