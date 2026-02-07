/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        breakfast: {
          orange: '#FF9A56',
          yellow: '#FFE066',
          cream: '#FFF5E6',
          warm: '#FFB366',
        }
      },
      backgroundImage: {
        'warm-gradient': 'linear-gradient(135deg, #FF9A56 0%, #FFE066 50%, #FFB366 100%)',
        'card-gradient': 'linear-gradient(145deg, #FFF9F0 0%, #FFF5E6 100%)',
      },
      animation: {
        'bounce-select': 'bounce-select 0.5s ease-in-out',
        'spin-select': 'spin-select 0.6s ease-in-out',
      },
      keyframes: {
        'bounce-select': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'spin-select': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
