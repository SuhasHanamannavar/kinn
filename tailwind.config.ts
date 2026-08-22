import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        kin: {
          bg: '#FAFAF7',
          ink: '#1A1A1E',
          ink2: '#2A2A3A',
          muted: '#5A5D6B',
          muted2: '#8A8D9A',
          border: 'rgba(0,0,0,0.08)',
          eyebrow: '#2D5F8A',
          beak: '#FF8C42',
          beak2: '#FF9A3C',
          cheek: '#FFB347',
        },
        cat: {
          content: '#0891B2',
          pricing: '#D97706',
          policy: '#7C3AED',
          feature: '#059669',
          announce: '#BE185D',
          deadline: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'lg': '10px',
        'xl': '12px',
        '2xl': '14px',
        '3xl': '16px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.05)',
        'modal': '0 20px 60px rgba(0,0,0,0.2)',
      },
      keyframes: {
        kinBob: {
          '0%, 100%': { transform: 'translateY(0) rotate(-.5deg)' },
          '50%': { transform: 'translateY(-2px) rotate(.5deg)' },
        },
        kinBlink: {
          '0%, 94%, 100%': { transform: 'scaleY(1)' },
          '97%': { transform: 'scaleY(0.05)' },
        },
        wingFlap: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(-5deg)' },
        },
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          'from': { opacity: '0', transform: 'translateX(-8px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        modalIn: {
          'from': { opacity: '0', transform: 'scale(.96) translateY(8px)' },
          'to': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        overlayIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        msgIn: {
          'from': { opacity: '0', transform: 'translateY(6px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 80%, 100%': { opacity: '.3' },
          '40%': { opacity: '1' },
        },
        thinkingSpin: {
          'from': { transform: 'rotate(0)' },
          'to': { transform: 'rotate(360)' },
        },
      },
      animation: {
        'kin-bob': 'kinBob 3.5s ease-in-out infinite',
        'kin-blink': 'kinBlink 4.5s ease-in-out infinite',
        'wing-flap': 'wingFlap 5s ease-in-out infinite',
        'fade-up': 'fadeUp .4s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in': 'slideIn .3s cubic-bezier(0.16,1,0.3,1) both',
        'modal-in': 'modalIn .25s cubic-bezier(0.16,1,0.3,1) both',
        'overlay-in': 'overlayIn .2s ease both',
        'msg-in': 'msgIn .3s ease both',
        'pulse-dot': 'pulseDot 1.8s ease-in-out infinite',
        'thinking-spin': 'thinkingSpin 1.2s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
