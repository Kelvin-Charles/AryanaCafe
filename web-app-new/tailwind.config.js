/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        secondary: 'var(--color-secondary)',
        brand: {
          500: '#4318FF',
        },
        navy: {
          50: '#E9E9F7',
          100: '#C8C8ED',
          200: '#A7A7E3',
          300: '#8585D9',
          400: '#6464CF',
          500: '#4343C5',
          600: '#3232BB',
          700: '#2121B1',
          800: '#1010A7',
          900: '#00009D',
        },
        shadow: {
          500: 'rgba(112, 144, 176, 0.08)',
        },
      },
      boxShadow: {
        '3xl': '0 10px 20px rgba(112, 144, 176, 0.08)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(310deg,#7928CA,#FF0080)',
        'gradient-secondary': 'linear-gradient(310deg,#627594,#A8B8D8)',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
    },
  },
  plugins: [],
} 