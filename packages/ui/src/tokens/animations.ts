export const animations = {
  duration: {
    instant: '0ms',
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '700ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  keyframes: {
    flyToBag: {
      '0%': { transform: 'scale(1) translate(0, 0)', opacity: '1' },
      '50%': { transform: 'scale(0.6) translate(var(--fly-x), var(--fly-y)) rotate(180deg)' },
      '100%': { transform: 'scale(0.3) translate(var(--fly-end-x), var(--fly-end-y)) rotate(360deg)', opacity: '0' },
    },
    shake: {
      '0%, 100%': { transform: 'translateX(0)' },
      '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
      '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
    },
    pulse: {
      '0%, 100%': { opacity: '1', transform: 'scale(1)' },
      '50%': { opacity: '0.7', transform: 'scale(1.05)' },
    },
    bounce: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },
    squashStretch: {
      '0%': { transform: 'scale(1, 1)' },
      '30%': { transform: 'scale(1.15, 0.85)' },
      '50%': { transform: 'scale(0.9, 1.1)' },
      '70%': { transform: 'scale(1.05, 0.95)' },
      '100%': { transform: 'scale(1, 1)' },
    },
    confettiFall: {
      '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
      '100%': { transform: 'translateY(300px) rotate(720deg)', opacity: '0' },
    },
    slideUp: {
      '0%': { transform: 'translateY(20px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    scaleIn: {
      '0%': { transform: 'scale(0.9)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' },
    },
  },
} as const;
