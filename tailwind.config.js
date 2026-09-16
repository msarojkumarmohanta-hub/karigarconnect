/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { ink: '#262523', terracotta: '#bd5b3d', forest: '#173f35', cream: '#f7f1e8', gold: '#d49b43' },
      fontFamily: { display: ['DM Serif Display', 'serif'], sans: ['DM Sans', 'sans-serif'] },
      boxShadow: { soft: '0 16px 50px rgba(54, 39, 21, .09)' }
    }
  },
  plugins: []
}
