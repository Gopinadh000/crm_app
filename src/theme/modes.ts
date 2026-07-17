import type { ModeTokens, StatusTokens, ThemeMode } from './types'

/** Shared status colors (same in light and dark; soft washes differ by mode) */
export const statusColors: StatusTokens = {
  error: '#dc2626',
  warning: '#d97706',
  success: '#16a34a',
}

export const modePalettes: Record<ThemeMode, ModeTokens> = {
  light: {
    bg: '#f3f4f6',
    surface: '#ffffff',
    surfaceMuted: '#f9fafb',
    border: '#e5e7eb',
    borderStrong: '#d1d5db',
    text: '#111827',
    textSecondary: '#374151',
    textMuted: '#6b7280',
    textInverse: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.45)',
    shadow: '0 8px 24px rgb(0 0 0 / 0.12)',
    errorSoft: '#fef2f2',
    warningSoft: '#fffbeb',
    successSoft: '#f0fdf4',
  },
  dark: {
    bg: '#0b1220',
    surface: '#111827',
    surfaceMuted: '#1f2937',
    border: '#374151',
    borderStrong: '#4b5563',
    text: '#f9fafb',
    textSecondary: '#e5e7eb',
    textMuted: '#9ca3af',
    textInverse: '#111827',
    overlay: 'rgba(0, 0, 0, 0.65)',
    shadow: '0 8px 24px rgb(0 0 0 / 0.45)',
    errorSoft: '#3f1d1d',
    warningSoft: '#3b2f14',
    successSoft: '#143525',
  },
}
