/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg:      '#0f1117',
          surface: '#1a1d27',
          border:  '#2d3148',
          text:    '#e2e8f0',
          muted:   '#8892a4',
        }
      }
    },
  },
  plugins: [],
};