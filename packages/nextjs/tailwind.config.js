/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind is only used for utility fallbacks — primary styles are in globals.css
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};
