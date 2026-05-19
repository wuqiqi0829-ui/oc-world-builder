import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5F0FA',
          100: '#EBE0F5',
          200: '#D4C1EB',
          300: '#BDA2E0',
          400: '#A683D6',
          500: '#8E6BCC',
          600: '#7C5CBF',
          700: '#6A48B3',
          800: '#5A3A9E',
          900: '#4A2D85',
        },
        surface: {
          50: '#FAFAFA',
          100: '#F5F3F7',
          200: '#EEECF2',
          300: '#E5E2EB',
          700: '#3D3A45',
          800: '#2C2935',
          900: '#1A1822',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        input: '6px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '120': '30rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
