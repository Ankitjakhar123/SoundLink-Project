/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#0a0a0a",
        "black-true": "#000",
        "primary-dark": "#18181b",
        accent: "#f472b6",
        "accent-dark": "#a21caf",
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': {
            'background-position': '0% 50%'
          },
          '50%': {
            'background-position': '100% 50%'
          }
        }
      },
      animation: {
        'gradient-shift': 'gradient-shift 15s ease infinite',
      },
      backgroundSize: {
        'gradient-shift': '200% 200%',
      }
    },
  },
  plugins: [],
}