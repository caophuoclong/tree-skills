// ─── Neobrutalism Font Stack ─────────────────────────────────────────────────
//
//  Display + Body: Space Grotesk
//    A geometric grotesque with ink traps and subtly quirky letterforms.
//    Punchy at heavy weights, very readable at medium — ideal for NB UIs.
//    Loaded weights: 300 · 400 · 500 · 600 · 700
//
//  Mono: Space Mono
//    The monospace companion to the Space family. Retro-digital character
//    that pairs perfectly with NB's raw, technical aesthetic.
//    Loaded weights: 400 · 700

export const Typography = {
  // ── Large display headings (screen titles, hero numbers) ─────────────────
  displayXL: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  // ── Section headings, card titles ────────────────────────────────────────
  displayLG: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  // ── Sub-titles, modal headings ───────────────────────────────────────────
  title: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  // ── Primary body text ────────────────────────────────────────────────────
  bodyLG: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  // ── Standard body text ───────────────────────────────────────────────────
  body: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 21,
    letterSpacing: 0,
  },
  // ── Labels, captions ─────────────────────────────────────────────────────
  caption: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  // ── Tiny uppercase badges / eyebrow labels ───────────────────────────────
  micro: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 10,
    fontWeight: '700' as const,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  // ── Numbers, XP counters, level values (mono for alignment) ──────────────
  statsMono: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  // ── Bold mono for large stat numbers ─────────────────────────────────────
  statsMonoBold: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
} as const;
