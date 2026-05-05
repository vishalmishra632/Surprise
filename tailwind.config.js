/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#08080F',
        midnight: '#0D0D14',
        charcoal: '#1A1A22',
        graphite: '#272730',
        champagne: '#E5C68A',
        gold: '#D4AF37',
        goldsoft: '#C9A96B',
        rose: '#E8A8B9',
        rosedeep: '#C7869B',
        glow: '#F9E7C5',
        cream: '#F4EBD8',
        mist: 'rgba(244, 235, 216, 0.04)',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
        script: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      boxShadow: {
        glow: '0 0 60px rgba(212, 175, 55, 0.32), 0 0 120px rgba(212, 175, 55, 0.18)',
        rose: '0 0 60px rgba(232, 168, 185, 0.32), 0 0 120px rgba(232, 168, 185, 0.16)',
        glass:
          '0 24px 48px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(244, 235, 216, 0.08)',
        polaroid:
          '0 4px 12px rgba(0, 0, 0, 0.5), 0 24px 48px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(244, 235, 216, 0.10)',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '0.7' },
        },
        slowFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        glowPulse: {
          '0%, 100%': {
            boxShadow:
              '0 0 32px rgba(212, 175, 55, 0.42), 0 0 80px rgba(212, 175, 55, 0.22)',
          },
          '50%': {
            boxShadow:
              '0 0 60px rgba(212, 175, 55, 0.7), 0 0 140px rgba(212, 175, 55, 0.4)',
          },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        twinkle: 'twinkle 4s ease-in-out infinite',
        slowFloat: 'slowFloat 7s ease-in-out infinite',
        glowPulse: 'glowPulse 3.2s ease-in-out infinite',
        gradientShift: 'gradientShift 14s ease infinite',
      },
    },
  },
  plugins: [],
};
