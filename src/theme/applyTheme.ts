import { buildThemeCssVars } from './buildTheme'
import type { ThemeMode, ThemePalette } from './types'

/** Apply theme tokens as CSS variables on <html> */
export const applyTheme = (mode: ThemeMode, palette: ThemePalette) => {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.setAttribute('data-theme', mode)
  root.setAttribute('data-palette', palette)
  root.style.colorScheme = mode

  const vars = buildThemeCssVars(mode, palette)
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}
