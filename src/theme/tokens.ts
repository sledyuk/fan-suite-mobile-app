// Design tokens measured from the FanSuite Figma mockups.
// Source of truth: docs/context/04-design-tokens.md. Values map onto the
// Tailwind zinc/neutral scale, which is what the web app appears to use.
export const colors = {
  primary: '#5863DE',
  primaryPressed: '#545ED1',
  primarySoft: '#EAEBFB',
  primaryTint: '#F6F7FD',
  gift: '#8258DE',

  textPrimary: '#18181B',
  textHeading: '#0A0A0A',
  textSecondary: '#3F3F46',
  textMuted: '#71717A',
  textPlaceholder: '#737373',
  textSection: '#52525B',

  bg: '#FFFFFF',
  bgIncoming: '#F4F4F5',
  bgSubtle: '#F5F5F5',
  bgPanel: '#FAFAFA',
  border: '#E5E5E5',
  divider: '#E4E4E7',

  online: '#16A34A',
  error: '#DE3333',
  errorSoft: '#FEF2F2',
  verified: '#2563EB',
  warningBg: '#FEF3C7',
  warningText: '#92400E',
  successBg: '#DCFCE7',
  successText: '#166534',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 40 } as const;

// iOS 26 favours larger, concentric corners: an inner element's radius = outer radius - padding.
export const radii = { sm: 6, md: 8, lg: 10, card: 14, xl: 16, sheet: 30 } as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
} as const;

export const type = {
  title: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  name: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 20 },
  badge: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  time: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
} as const;

export type TypeVariant = keyof typeof type;
