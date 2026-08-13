/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A8A', // Government Navy Deep Blue
          light: '#2563EB',
          dark: '#1E293B',
        },
        secondary: {
          DEFAULT: '#059669', // Emerald Green
          light: '#10B981',
          dark: '#065F46',
        },
        accent: {
          DEFAULT: '#D97706', // Saffron / Gold Accent
          light: '#F59E0B',
        },
        background: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
