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
        plum: {
          950: '#1b0429',
          900: '#2E1065',
          800: '#3B0764',
          700: '#4C1D95',
          600: '#581c87',
        },
        blush: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
        },
        lilac: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
        },
        butter: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
        },
        mint: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
        },
        dorm: {
          bg: '#0F0B18',
          card: '#1A132B',
          border: '#362759',
          muted: '#A594C9'
        }
      },
      fontFamily: {
        display: ['Fredoka', 'system-ui', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
        body: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'sticker': '3px 4px 0px rgba(46, 16, 101, 0.9)',
        'sticker-lg': '5px 6px 0px rgba(46, 16, 101, 0.9)',
        'sticker-hover': '1px 2px 0px rgba(46, 16, 101, 0.9)',
        'polaroid': '0 10px 25px -5px rgba(59, 7, 100, 0.15), 0 8px 10px -6px rgba(59, 7, 100, 0.1)',
        'wax': '0 4px 15px rgba(225, 29, 72, 0.4)',
      }
    },
  },
  plugins: [],
}
