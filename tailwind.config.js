/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
        },
        ink: {
          100: '#71717A',
          200: '#52525B',
          300: '#3F3F46',
          400: '#27272A',
          500: '#18181B',
        },
        fold: {
          blue: '#4F46E5',
          indigo: '#6366F1',
          purple: '#7C3AED',
        },
        echo: {
          glow: '#8B5CF6',
          soft: '#A78BFA',
        }
      },
      fontFamily: {
        script: ['Caveat', 'cursive'],
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};
