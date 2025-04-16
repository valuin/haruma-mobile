/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FF8C7C",
        secondary: "#FFB5A8",
        background: "#FFF5F3",
        text: "#4A4A4A",
        white: "#FFFFFF",
        border: "#FFD6CC",
        error: "#FF6B6B",
        success: "#7CD9B7",
      },
    },
  },
  plugins: [],
};
