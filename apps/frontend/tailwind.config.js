/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#060B08',
          900: '#0A120E',
          850: '#0E1A14',
          800: '#12221B',
          750: '#172B22',
          700: '#1C352A',
          600: '#234436',
          500: '#2F5A48',
          400: '#427A63',
          300: '#629E84',
        },
        mint: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        brand: {
          darkest: '#080C0A',
          dark: '#0A120E',
          card: '#111C16',
          cardElevated: '#16241D',
          border: '#1C3127',
          borderLight: '#264234',
        },
        accent: {
          blue: '#0284C7',
          purple: '#9333EA',
          amber: '#D97706',
          rose: '#E11D48',
          teal: '#0D9488',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'mint-glow': '0 0 20px -5px rgba(16, 185, 129, 0.25)',
        'mint-sm': '0 0 10px -2px rgba(16, 185, 129, 0.2)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
};

