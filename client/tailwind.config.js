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
      keyframes: {
        slideUp: {
          from: { opacity: '0', transform: 'translateY(1rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
