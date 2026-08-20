import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E63946',
        primaryLight: '#F25C69',
        primaryDark: '#B82E38',
        secondary: '#F4A261',
        secondaryLight: '#F7B883',
        accent: '#2A9D8F',
        accentLight: '#4DB8AB',
        dark: '#1D3557',
        darkLight: '#2A4A73',
        light: '#F1FAEE',
        lightDark: '#E0EDE5',
        gold: '#D4AF37',
        goldLight: '#E5C158',
        danger: '#D62828',
        dangerLight: '#E84A4A',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        flyToBag: 'fly-to-bag 700ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        shake: 'shake 500ms ease-in-out',
        pulseBorder: 'pulse-border 2s infinite',
        squashStretch: 'squash-stretch 400ms ease-in-out',
        confettiFall: 'confetti-fall 2s ease-out forwards',
        slideUp: 'slide-up 300ms ease-out forwards',
        fadeIn: 'fade-in 200ms ease-out forwards',
        scaleIn: 'scale-in 200ms ease-out forwards',
        bounceIn: 'bounce-in 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'fly-to-bag': {
          '0%': { transform: 'scale(1) translate(0, 0) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(0.6) translate(var(--fly-x, 0), var(--fly-y, -100px)) rotate(180deg)', opacity: '0.8' },
          '100%': { transform: 'scale(0.2) translate(var(--fly-end-x, 200px), var(--fly-end-y, -200px)) rotate(360deg)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        'pulse-border': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(230, 57, 70, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(230, 57, 70, 0)' },
        },
        'squash-stretch': {
          '0%': { transform: 'scale(1, 1)' },
          '30%': { transform: 'scale(1.2, 0.8)' },
          '50%': { transform: 'scale(0.85, 1.15)' },
          '70%': { transform: 'scale(1.05, 0.95)' },
          '100%': { transform: 'scale(1, 1)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(300px) rotate(720deg)', opacity: '0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
