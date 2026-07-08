/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        laposte: {
          yellow: '#FFCD00',
          anthracite: '#1B1B2F',
        },
      },
    },
  },
  plugins: [],
};
