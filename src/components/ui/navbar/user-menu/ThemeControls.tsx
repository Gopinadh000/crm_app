import { DarkModeOutlined, LightModeOutlined } from '@mui/icons-material'
import {
  brandPalettes,
  paletteLabels,
  type ThemePalette,
} from '../../../../theme'
import { useTheme } from '../../../../services/context/ThemeContext'

const paletteOrder: ThemePalette[] = ['blue', 'orange', 'pink', 'gray']

const ThemeControls = () => {
  const { mode, palette, setPalette, toggleMode } = useTheme()

  return (
    <div className="space-y-3 border-b border-app-border px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-app-text-muted">
          Appearance
        </p>
        <button
          type="button"
          onClick={toggleMode}
          aria-label={
            mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
          }
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-app-border bg-app-surface-muted px-2.5 text-xs font-medium text-app-text transition-colors hover:bg-app-primary-50 hover:text-app-primary-800"
        >
          {mode === 'light' ? (
            <DarkModeOutlined sx={{ fontSize: 16 }} />
          ) : (
            <LightModeOutlined sx={{ fontSize: 16 }} />
          )}
          {mode === 'light' ? 'Dark' : 'Light'}
        </button>
      </div>

      <div>
        <p className="mb-2 text-xs text-app-text-muted">Color palette</p>
        <div className="flex flex-wrap gap-2">
          {paletteOrder.map((id) => {
            const active = palette === id
            const swatch = brandPalettes[id][500]
            return (
              <button
                key={id}
                type="button"
                title={paletteLabels[id]}
                aria-label={`Use ${paletteLabels[id]} palette`}
                aria-pressed={active}
                onClick={() => setPalette(id)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'border-app-primary-500 bg-app-primary-50 text-app-primary-800'
                    : 'border-app-border bg-app-surface text-app-text-secondary hover:bg-app-surface-muted'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: swatch }}
                  aria-hidden
                />
                {paletteLabels[id]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ThemeControls
