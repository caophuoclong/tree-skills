export const Colors = {
  // Background
  bgBase: '#0D0D0F',
  bgBaseDayMode: '#121214',
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

export type BranchColor = 'career' | 'finance' | 'softskills' | 'wellbeing';

export const BranchColors: Record<BranchColor, string> = {
  career: Colors.career,
  finance: Colors.finance,
  softskills: Colors.softskills,
  wellbeing: Colors.wellbeing,
};
