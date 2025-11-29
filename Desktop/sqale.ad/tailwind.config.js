/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        arabic: ['IBM Plex Sans Arabic', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        neutral: {
          950: '#0A0A0A', // Custom dark bg
        }
      }
    },
  },
  plugins: [],
}
