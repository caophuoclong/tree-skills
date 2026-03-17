import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="assessment" />
      <Stack.Screen name="generating" />
      <Stack.Screen name="reveal" />
    </Stack>
  );
}
