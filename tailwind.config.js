/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fafd',
          100: '#ace1f7',
          500: '#2F6FA3',
          700: '#013a51',
        },
      },
    },
  },
  plugins: [],
}
