/**
 * App theme: dark and light mode. Modern, fluid palette.
 */
export const darkTheme = {
  dark: true as const,
  colors: {
    primary: '#a855f7',
    background: '#0c0c0f',
    card: '#0c0c0f',
    text: '#fafafa',
    border: '#27272a',
    notification: '#a855f7',
  },
  screen: {
    background: '#0c0c0f',
    card: '#18181b',
    cardBorder: '#27272a',
    text: '#fafafa',
    textMuted: '#a1a1aa',
    positive: '#22c55e',
    negative: '#ef4444',
    accent: '#a855f7',
    accentMuted: 'rgba(168, 85, 247, 0.15)',
  },
  fonts: {
    bold: { fontWeight: '700' as const },
    medium: { fontWeight: '500' as const },
    regular: { fontWeight: '400' as const },
    heavy: { fontWeight: '700' as const },
  },
};

export const lightTheme = {
  dark: false as const,
  colors: {
    primary: '#7c3aed',
    background: '#fafafa',
    card: '#ffffff',
    text: '#18181b',
    border: '#e4e4e7',
    notification: '#7c3aed',
  },
  screen: {
    background: '#fafafa',
    card: '#ffffff',
    cardBorder: '#e4e4e7',
    text: '#18181b',
    textMuted: '#71717a',
    positive: '#16a34a',
    negative: '#dc2626',
    accent: '#7c3aed',
    accentMuted: 'rgba(124, 58, 237, 0.12)',
  },
  fonts: darkTheme.fonts,
};

export type AppTheme = typeof darkTheme;
