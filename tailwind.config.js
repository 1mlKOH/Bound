/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: {
          dark: "#0F1015",
          light: "#F3F3F5",
        },
        card: {
          dark: "#1B1C22",
          light: "#FFFFFF",
          subtle: "#14151B"
        },
        border: {
          dark: "#282932",
          light: "#E3E3E8",
        },
        status: {
          safe: "#3DDC84",
          safeDark: "#0D8A33",
          warning: "#FFB020",
          danger: "#FF6B72",
          absent: "#D6336C",
          cancelled: "#4A5568",
        },
        palette: {
          emerald: "#1FB45A",
          sky: "#1E9BFF",
          purple: "#A25CF2",
          pink: "#F2459B",
          orange: "#FF8A1F",
          yellow: "#FFC21A",
          teal: "#14B8A6",
          indigo: "#6C7BFF",
        }
      },
      borderRadius: {
        "card": "28px",
        "inner": "16px",
        "pill": "999px",
      }
    },
  },
  plugins: [],
};
