export const Motion = {
  spring: {
    bounce: { type: 'spring' as const, stiffness: 300, damping: 20 },
    smooth: { type: 'spring' as const, stiffness: 200, damping: 30 },
  },
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 600,
    cinematic: 800,
  },
} as const;
