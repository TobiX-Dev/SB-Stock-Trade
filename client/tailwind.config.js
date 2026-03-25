/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night:   { DEFAULT: '#080c14', 100: '#0d1220', 200: '#111827', 300: '#1a2235' },
        teal:    { DEFAULT: '#00d4aa', dark: '#00b894', dim: '#00d4aa20' },
        crimson: { DEFAULT: '#ff4757', dim: '#ff475720' },
        slate:   { 400: '#94a3b8', 500: '#64748b', 600: '#475569' },
        gold:    { DEFAULT: '#f59e0b' },
      },
      fontFamily: {
        mono:  ['"JetBrains Mono"', 'monospace'],
        sans:  ['"DM Sans"', 'sans-serif'],
        display: ['"Sora"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'ticker': 'ticker 30s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        ticker:  { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      }
    }
  },
  plugins: []
}
