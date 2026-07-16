/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      // Mobile-first custom aliases (min-width)
      mobile: '480px', // large phones
      tablet: '768px', // tablets
      desktop: '1024px', // laptops / desktops
      // Standard aliases kept in sync
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {},
  },
  plugins: [],
}
