/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: "#0F766E",
          amber: "#F59E0B",
          bg: "#F0FDFA",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        hindi: ["var(--font-noto-devanagari)", "Noto Sans Devanagari", "sans-serif"],
      },
      keyframes: {
        "bounce-dot": {
          "0%, 80%, 100%": { transform: "scale(0)" },
          "40%": { transform: "scale(1)" },
        },
      },
      animation: {
        "bounce-dot": "bounce-dot 1.4s infinite ease-in-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
