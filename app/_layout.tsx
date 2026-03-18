import { QueryClientProvider } from '@tanstack/react-query';
import {
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from '@expo-google-fonts/space-mono';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Text, View } from 'react-native';

import { queryClient } from '@/src/business-logic/api/query-client';
import { LevelUpModal, LoginBonusModal } from '@/src/ui/molecules';
import { useTheme } from '@/src/ui/tokens';

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Text as any).defaultProps = (Text as any).defaultProps ?? {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Text as any).defaultProps.style = { fontFamily: 'SpaceGrotesk-Regular' };

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { isDark, colors } = useTheme();

  const [fontsLoaded] = useFonts({
    'SpaceGrotesk-Light':    SpaceGrotesk_300Light,
    'SpaceGrotesk-Regular':  SpaceGrotesk_400Regular,
    'SpaceGrotesk-Medium':   SpaceGrotesk_500Medium,
    'SpaceGrotesk-SemiBold': SpaceGrotesk_600SemiBold,
    'SpaceGrotesk-Bold':     SpaceGrotesk_700Bold,
    'SpaceMono-Regular':     SpaceMono_400Regular,
    'SpaceMono-Bold':        SpaceMono_700Bold,
  });

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
        <Stack.Screen name="quest/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="leaderboard" />
        <Stack.Screen name="wellbeing" />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="skill-builder" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.bgBase} />
      <LevelUpModal />
      <LoginBonusModal />
    </QueryClientProvider>
  );
}
