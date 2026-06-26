/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#0066FF',
          600: '#0052cc',
          700: '#0A2540',
          800: '#082040',
          900: '#051830',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.04)',
        elevated: '0 4px 12px rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.04)',
        modal: '0 20px 60px rgba(0,0,0,.12), 0 4px 16px rgba(0,0,0,.06)',
      },
      animation: {
        'fade-in': 'fadeIn .2s ease',
        'slide-in': 'slideIn .2s ease',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'none' } },
      },
    },
  },
  plugins: [],
}
