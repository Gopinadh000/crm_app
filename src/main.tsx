import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './services/context/AuthContext'
import { ThemeProvider } from './services/context/ThemeContext'
import { applyTheme, type ThemeMode, type ThemePalette } from './theme'

const bootMode = ((): ThemeMode => {
  const stored = localStorage.getItem('crm_theme_mode')
  if (stored === 'light' || stored === 'dark') return stored
  return 'light'
})()

const bootPalette = ((): ThemePalette => {
  const stored = localStorage.getItem('crm_theme_palette')
  if (
    stored === 'blue' ||
    stored === 'orange' ||
    stored === 'gray' ||
    stored === 'pink'
  ) {
    return stored
  }
  return 'blue'
})()

// Apply theme before React mounts — prevents transparent / broken surfaces
applyTheme(bootMode, bootPalette)

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>,
)
