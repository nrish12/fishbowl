/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FDFDF8',
          100: '#FAF9F2',
          200: '#F5F3E8',
          300: '#EBE8D6',
          400: '#D4D0BA',
          cream: '#FFF8E7',
        },
        ink: {
          100: '#8B8570',
          200: '#6B6656',
          300: '#4A483C',
          400: '#2E2D24',
          500: '#1C1B16',
          charcoal: '#2A2922',
        },
        forest: {
          50: '#F0F7F4',
          100: '#D8EDE3',
          200: '#B3DCC8',
          300: '#7DC4A0',
          400: '#4AA67E',
          500: '#2D8B5F',
          600: '#1E7049',
          700: '#165839',
          800: '#0F3F2A',
        },
        gold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
        },
        sage: {
          100: '#E8EDE8',
          200: '#CBD5CC',
          300: '#A8B8AA',
          400: '#7A8F7D',
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
