/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0A0A0F',
          card: '#111118',
          elevated: '#16161F',
          hover: '#1A1A26',
          input: '#0D0D14',
        },
        primary: {
          DEFAULT: '#1B3A5C',
          mid: '#1E4268',
        },
        accent: {
          DEFAULT: '#C9A84C',
          dim: 'rgba(201,168,76,0.10)',
          glow: 'rgba(201,168,76,0.20)',
          line: 'rgba(201,168,76,0.35)',
        },
        // keep legacy brand tokens so nothing breaks
        brand: {
          dark: '#0A0A0F',
          ocean: '#1B3A5C',
          gold: '#C9A84C',
        },
        sync: {
          green: '#22C55E',
          red: '#EF4444',
        },
        text: {
          primary: '#F0F0F5',
          secondary: '#8E8EA0',
          tertiary: '#4A4A5C',
          accent: '#C9A84C',
        },
      },
      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
        // remove Outfit — DM Sans is used everywhere
      },
      spacing: {
        '4.5': '18px',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'breathe': 'breathe 2.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.8)' },
        },
      },
    },
  },
  plugins: [],
}
