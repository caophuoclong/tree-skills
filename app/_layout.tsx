import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { queryClient } from '@/src/business-logic/api/query-client';
import { LevelUpModal, LoginBonusModal } from '@/src/ui/molecules';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="branch/[id]" />
        <Stack.Screen name="quest/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="leaderboard" />
        <Stack.Screen name="wellbeing" />
      </Stack>
      <StatusBar style="light" backgroundColor="#0D0D0F" />
      <LevelUpModal />
      <LoginBonusModal />
    </QueryClientProvider>
  );
}
