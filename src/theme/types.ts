export type ThemeMode = 'light' | 'dark'
export type ThemePalette = 'blue' | 'orange' | 'gray' | 'pink'

/** Lean brand scale used across the app */
export type BrandScale = {
  50: string
  100: string
  500: string
  800: string
  900: string
}

/** Surfaces + text for light / dark */
export type ModeTokens = {
  bg: string
  surface: string
  surfaceMuted: string
  border: string
  borderStrong: string
  text: string
  textSecondary: string
  textMuted: string
  textInverse: string
  overlay: string
  shadow: string
  errorSoft: string
  warningSoft: string
  successSoft: string
}

export type StatusTokens = {
  error: string
  warning: string
  success: string
}

/** Flat map of CSS custom properties applied to <html> */
export type CssVarMap = Record<string, string>
