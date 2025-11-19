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
          50: '#F5FAF7',
          100: '#E6F4ED',
          200: '#C8E6D7',
          300: '#9DD4BA',
          400: '#6BB896',
          500: '#3E6B48',
          600: '#2F5438',
          700: '#234029',
          800: '#1A2F1F',
        },
        gold: {
          50: '#FFFEF5',
          100: '#FFFBEA',
          200: '#FFF6D1',
          300: '#FFECAA',
          400: '#FFD966',
          500: '#F4C430',
          600: '#D4A92C',
          700: '#B88F24',
          800: '#8C6B1A',
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
