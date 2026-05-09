/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        spore: {
          50: "#faf7f2",
          100: "#f2ebe0",
          200: "#e4d5be",
          300: "#d0b896",
          400: "#bc9a70",
          500: "#a87d52",
          600: "#8f6440",
          700: "#744e33",
          800: "#5e3f2b",
          900: "#4d3425",
        },
        myco: {
          50: "#f3f9f0",
          100: "#e3f2db",
          200: "#c6e5b8",
          300: "#9dd18a",
          400: "#74b860",
          500: "#539e40",
          600: "#3f7e30",
          700: "#336429",
          800: "#2c5023",
          900: "#25431e",
        },
      },
    },
  },
  plugins: [],
}

