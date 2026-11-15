/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F4F1EA',
          dark: '#E6E1D5',
          aged: '#DCD5C4',
          light: '#FAF8F4',
        },
        ink: {
          DEFAULT: '#1A1A1A',
          muted: '#4A463F',
          faint: '#7A7469',
        },
        crimson: {
          DEFAULT: '#C82333',
          dark: '#9E1B28',
          light: '#F8D7DA',
        },
        royal: {
          DEFAULT: '#1D4ED8',
          dark: '#1E3A8A',
          light: '#DBEAFE',
        },
        gold: {
          DEFAULT: '#D97706',
          dark: '#B45309',
          light: '#FEF3C7',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Courier Prime"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        press: '3px 3px 0px 0px #1A1A1A',
        'press-sm': '2px 2px 0px 0px #1A1A1A',
        'press-lg': '5px 5px 0px 0px #1A1A1A',
        'press-crimson': '3px 3px 0px 0px #C82333',
        'press-royal': '3px 3px 0px 0px #1D4ED8',
        'press-gold': '3px 3px 0px 0px #D97706',
      }
    },
  },
  plugins: [],
};
