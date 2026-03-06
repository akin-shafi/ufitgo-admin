/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  darkMode: ["class", '[data-theme="dark"]'],

  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      colors: {
        /* Core theme tokens */
        bg: "rgb(var(--bg) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",

        /* Semantic colors (safe for light & dark) */
        success: "rgb(var(--success, 34 197 94) / <alpha-value>)",
        warning: "rgb(var(--warning, 245 158 11) / <alpha-value>)",
        danger: "rgb(var(--danger, 239 68 68) / <alpha-value>)",
        info: "rgb(var(--info, 59 130 246) / <alpha-value>)",
      },

      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },

      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
    },
  },

  plugins: [],
}


