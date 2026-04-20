/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#378ADD',
        positive: '#639922',
        negative: '#E24B4A',
        pending: '#EF9F27',
      },
      fontFamily: {
        heebo: ['Heebo', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
};
