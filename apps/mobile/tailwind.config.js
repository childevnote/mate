/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
        "primary-foreground": "#ffffff",
        background: "#f9fafb",
        foreground: "#111827",
        muted: "#6b7280",
        border: "#e5e7eb",
      },
    },
  },
  plugins: [],
};
