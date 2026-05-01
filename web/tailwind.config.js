/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9ecff',
          200: '#bcdfff',
          300: '#8eccff',
          400: '#59b0ff',
          500: '#338dfc',
          600: '#1d6ef1',
          700: '#1558de',
          800: '#1849b4',
          900: '#1a408e',
          950: '#152856',
        },
      },
    },
  },
  plugins: [],
}
