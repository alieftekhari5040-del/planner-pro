/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#06061a',
        surface: 'rgba(16,16,43,0.72)',
        surface2: '#16163a',
        line: '#2d2d5e',
        border: '#7c5cff',
        glow: 'rgba(124,92,255,0.35)',
        ink: '#f0ecff',
        muted: '#8f8fb8',
        accent: '#ff3b4f',
        lavender: '#b9a7ff',
      },
      fontFamily: {
        vazir: ['Vazirmatn', 'Tahoma', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(124,92,255,0.16), inset 0 1px 0 rgba(255,255,255,0.05)',
        neon: '0 0 24px rgba(124,92,255,0.35)',
        'neon-red': '0 0 14px rgba(255,59,79,0.55)',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '24px',
      },
      animation: {
        'aurora-1': 'aurora1 18s ease-in-out infinite alternate',
        'aurora-2': 'aurora2 22s ease-in-out infinite alternate',
        'fade-up': 'fadeUp 0.6s ease-out both',
        'pop-in': 'popIn 0.25s ease-out both',
      },
      keyframes: {
        aurora1: {
          '0%': { transform: 'translate3d(-10%, -8%, 0) scale(1)' },
          '100%': { transform: 'translate3d(12%, 10%, 0) scale(1.25)' },
        },
        aurora2: {
          '0%': { transform: 'translate3d(8%, 10%, 0) scale(1.1)' },
          '100%': { transform: 'translate3d(-10%, -6%, 0) scale(0.9)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
