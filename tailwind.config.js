/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      mobile: '480px',
      tablet: '768px',
      desktop: '1024px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      // Values are set at runtime from src/theme (TypeScript)
      colors: {
        app: {
          primary: {
            50: 'var(--app-primary-50)',
            100: 'var(--app-primary-100)',
            500: 'var(--app-primary-500)',
            800: 'var(--app-primary-800)',
            900: 'var(--app-primary-900)',
          },
          secondary: {
            50: 'var(--app-secondary-50)',
            100: 'var(--app-secondary-100)',
            500: 'var(--app-secondary-500)',
            800: 'var(--app-secondary-800)',
            900: 'var(--app-secondary-900)',
          },
          bg: 'var(--app-bg)',
          surface: 'var(--app-surface)',
          'surface-muted': 'var(--app-surface-muted)',
          border: 'var(--app-border)',
          'border-strong': 'var(--app-border-strong)',
          text: 'var(--app-text)',
          'text-secondary': 'var(--app-text-secondary)',
          'text-muted': 'var(--app-text-muted)',
          'text-inverse': 'var(--app-text-inverse)',
          error: 'var(--app-error)',
          'error-soft': 'var(--app-error-soft)',
          warning: 'var(--app-warning)',
          'warning-soft': 'var(--app-warning-soft)',
          success: 'var(--app-success)',
          'success-soft': 'var(--app-success-soft)',
        },
      },
    },
  },
  plugins: [],
}
