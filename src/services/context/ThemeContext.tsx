import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  applyTheme,
  type ThemeMode,
  type ThemePalette,
} from '../../theme'

type ThemeContextValue = {
  mode: ThemeMode
  palette: ThemePalette
  setMode: (mode: ThemeMode) => void
  setPalette: (palette: ThemePalette) => void
  toggleMode: () => void
}

const STORAGE_MODE = 'crm_theme_mode'
const STORAGE_PALETTE = 'crm_theme_palette'

const ThemeContext = createContext<ThemeContextValue | null>(null)

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === 'light' || value === 'dark'

const isThemePalette = (value: string | null): value is ThemePalette =>
  value === 'blue' ||
  value === 'orange' ||
  value === 'gray' ||
  value === 'pink'

const readStoredMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_MODE)
  if (isThemeMode(stored)) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

const readStoredPalette = (): ThemePalette => {
  if (typeof window === 'undefined') return 'blue'
  const stored = localStorage.getItem(STORAGE_PALETTE)
  return isThemePalette(stored) ? stored : 'blue'
}

// useLayoutEffect on client; useEffect fallback for SSR safety
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredMode())
  const [palette, setPaletteState] = useState<ThemePalette>(() =>
    readStoredPalette(),
  )

  // Paint theme before browser paint to avoid transparent / flashy UI
  useIsoLayoutEffect(() => {
    applyTheme(mode, palette)
    localStorage.setItem(STORAGE_MODE, mode)
    localStorage.setItem(STORAGE_PALETTE, palette)
  }, [mode, palette])

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
  }, [])

  const setPalette = useCallback((next: ThemePalette) => {
    setPaletteState(next)
  }, [])

  const toggleMode = useCallback(() => {
    setModeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const value = useMemo(
    () => ({ mode, palette, setMode, setPalette, toggleMode }),
    [mode, palette, setMode, setPalette, toggleMode],
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}

export type { ThemeMode, ThemePalette }
