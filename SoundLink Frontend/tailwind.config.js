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
    },
  },
  plugins: [],
}