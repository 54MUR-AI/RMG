/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        samurai: {
          red: '#E63946',
          'red-dark': '#C1121F',
          'red-darker': '#8B0000',
          steel: '#6B7280',
          'steel-light': '#9CA3AF',
          'steel-dark': '#4B5563',
          black: '#0A0A0A',
          'grey-dark': '#1F2937',
          'grey-darker': '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'flame-flicker': 'flameFlicker 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        flameFlicker: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(230, 57, 70, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(230, 57, 70, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
