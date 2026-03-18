import { Stack } from 'expo-router';

export default function SkillBuilderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_bottom' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="generating" />
      <Stack.Screen name="editor" />
    </Stack>
  );
}
