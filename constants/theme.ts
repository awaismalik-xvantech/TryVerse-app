export const Colors = {
  light: {
    text: '#1a1a2e',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    background: '#f8f7fc',
    surface: '#ffffff',
    surfaceSecondary: '#f3f4f6',
    border: '#e5e7eb',
    borderLight: '#f0f0f5',
    tint: '#c9a96e',
    gold: '#c9a96e',
    goldLight: '#e8c98a',
    goldDark: '#b08d4f',
    charcoal: '#1a1a2e',
    ivory: '#f8f7fc',
    icon: '#6b7280',
    tabIconDefault: '#9ca3af',
    tabIconSelected: '#c9a96e',
    danger: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  dark: {
    text: '#f8f7fc',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    background: '#0f0f1a',
    surface: '#1a1a2e',
    surfaceSecondary: '#252238',
    border: '#2d2d3f',
    borderLight: '#1e1b2e',
    tint: '#e8c98a',
    gold: '#c9a96e',
    goldLight: '#e8c98a',
    goldDark: '#b08d4f',
    charcoal: '#1a1a2e',
    ivory: '#f8f7fc',
    icon: '#9ca3af',
    tabIconDefault: '#6b7280',
    tabIconSelected: '#e8c98a',
    danger: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
};

export const Gradients = {
  gold: ['#c9a96e', '#e8c98a'] as const,
  charcoal: ['#1a1a2e', '#2d2d3f'] as const,
  subtle: ['#faf8f5', '#f5f3ff'] as const,
  storeCard: ['#c9a96e', '#d4a855'] as const,
  tryonCard: ['#e8618c', '#c0507a'] as const,
  stylistCard: ['#8b6cc7', '#6e54a3'] as const,
  poseCard: ['#6b9b7a', '#537a62'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
} as const;

export const TAB_BAR_SPACER = 100;
