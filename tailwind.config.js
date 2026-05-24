/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
        fadeUp: {
          '0%':   { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulse2: {
          '0%, 100%': { opacity: 1 },
          '50%':      { opacity: 0.5 },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        shimmer:       'shimmer 2s infinite linear',
        float:         'float 5s ease-in-out infinite',
        fadeUp:        'fadeUp 0.6s ease-out forwards',
        pulse2:        'pulse2 3s ease-in-out infinite',
        gradientShift: 'gradientShift 6s ease infinite',
      },
      boxShadow: {
        glass:   '0 8px 32px rgba(0,0,0,0.1)',
        card:    '0 4px 24px rgba(0,0,0,0.07)',
        hover:   '0 20px 60px rgba(0,0,0,0.15)',
        glow:    '0 0 40px rgba(139,92,246,0.35)',
        'glow-sm': '0 0 20px rgba(139,92,246,0.2)',
      },
      backgroundSize: {
        '300%': '300% 300%',
      },
    },
  },
  plugins: [],
}
