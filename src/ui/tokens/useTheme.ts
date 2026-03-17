import { useActiveTheme } from '@/src/business-logic/stores/themeStore';
import { getThemeColors, ThemeType } from './colors';

/**
 * Hook that returns the active color palette based on current theme setting.
 */
export const useTheme = () => {
  const theme = useActiveTheme() as ThemeType;
  return {
    colors: getThemeColors(theme),
    isDark: theme === 'dark',
  };
};
