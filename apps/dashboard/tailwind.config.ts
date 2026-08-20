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
    },
  },
  plugins: [],
};

export default config;
