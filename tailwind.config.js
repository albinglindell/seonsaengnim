/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        korean: ["Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", "sans-serif"],
      },
      colors: {
        ink: { 950: "#0c0f14", 900: "#121826", 800: "#1c2433" },
        paper: "#f4f1ea",
        accent: "#c45c3e",
        mint: "#3d8b7a",
      },
    },
  },
  plugins: [],
};
