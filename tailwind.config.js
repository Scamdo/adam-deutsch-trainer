/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0b0d14',
          900: '#10131c',
          850: '#151926',
          800: '#1b2031',
          700: '#262c40',
          600: '#363d55',
        },
        brand: {
          50: '#eef1ff',
          100: '#e0e5ff',
          200: '#c7cfff',
          300: '#a3adff',
          400: '#7f86fb',
          500: '#6366f1',
          600: '#5145e5',
          700: '#4437c9',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,19,28,.04), 0 8px 24px -12px rgba(16,19,28,.12)',
        glow: '0 10px 40px -10px rgba(99,102,241,.55)',
      },
      keyframes: {
        pop: { '0%': { transform: 'scale(.96)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        rise: { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '20%,60%': { transform: 'translateX(-5px)' }, '40%,80%': { transform: 'translateX(5px)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        pop: 'pop .22s ease-out',
        rise: 'rise .35s ease-out both',
        shake: 'shake .4s ease-in-out',
      },
    },
  },
  plugins: [],
}
