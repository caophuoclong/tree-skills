export type ThemeType = 'light' | 'dark';

export const LightThemeColors = {
  // Background
  bgBase: '#F8F9FA',
  bgSurface: '#FFFFFF',
  bgElevated: '#F1F3F5',
  
  // Brand
  brandPrimary: '#7C6AF7',
  brandGlow: '#9E8FF9',
  
  // Branch accents
  career: '#3B82F6',
  finance: '#10B981',
  softskills: '#F59E0B',
  wellbeing: '#EC4899',

  // State
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  staminaOk: '#10B981',
  staminaMid: '#F59E0B',
  staminaLow: '#EF4444',

  // Text
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',

  // Glassmorphism
  glassBg: 'rgba(255,255,255,0.7)',
  glassBorder: 'rgba(0,0,0,0.06)',
} as const;

export const DarkThemeColors = {
  // Background
  bgBase: '#0D0D0F',
  bgSurface: '#161618',
  bgElevated: '#1E1E22',

  // Brand
  brandPrimary: '#7C6AF7',
  brandGlow: '#A89BFA',

  // Branch accents
  career: '#4DA8FF',
  finance: '#34D399',
  softskills: '#FBBF24',
  wellbeing: '#F472B6',

  // State
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  staminaOk: '#34D399',
  staminaMid: '#FBBF24',
  staminaLow: '#F87171',

  // Text
  textPrimary: '#F4F4F5',
  textSecondary: '#A1A1AA',
  textMuted: '#52525B',

  // Glassmorphism
  glassBg: 'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.08)',
} as const;

export const getThemeColors = (theme: ThemeType) => {
  return theme === 'dark' ? DarkThemeColors : LightThemeColors;
};

// Legacy and helper exports
export const Colors = DarkThemeColors;
export type BranchColor = 'career' | 'finance' | 'softskills' | 'wellbeing';

export const BranchColors: Record<BranchColor, string> = {
  career: DarkThemeColors.career,
  finance: DarkThemeColors.finance,
  softskills: DarkThemeColors.softskills,
  wellbeing: DarkThemeColors.wellbeing,
};
