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
          50: '#F2F6F4',
          100: '#E0EAE4',
          200: '#C1D5C9',
          300: '#8FAF9C',
          400: '#5D8A71',
          500: '#3E6B48',
          600: '#325539',
          700: '#27402B',
          800: '#1C2E1F',
        },
        gold: {
          50: '#FBF9F0',
          100: '#F6F2D9',
          200: '#EDE5B3',
          300: '#E4D88D',
          400: '#DBC667',
          500: '#D4AF37',
          600: '#B8992D',
          700: '#8F7723',
          800: '#665518',
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
