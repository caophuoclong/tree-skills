import { create } from 'zustand';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: 'system',
  setThemeMode: (mode) => set({ themeMode: mode }),
}));

/**
 * Hook to get the currently active theme ('light' or 'dark') resolving 'system'.
 */
export const useActiveTheme = (): 'light' | 'dark' => {
  const themeMode = useThemeStore((state) => state.themeMode);
  const systemTheme = useColorScheme();

  if (themeMode === 'system') {
    return systemTheme === 'light' ? 'light' : 'dark';
  }
  return themeMode;
};
