/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dce7ff',
          200: '#c0d5ff',
          300: '#95b9ff',
          400: '#6392ff',
          500: '#3b6af6',
          600: '#254ceb',
          700: '#1d3ad8',
          800: '#1d30af',
          900: '#1e2e8a',
          950: '#161e54',
        },
        surface: {
          light: '#f8fafc',
          dark: '#090d16',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
