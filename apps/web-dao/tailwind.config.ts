import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "320px",
      sm: "375px",
      mds: "425px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
    },
    extend: {
      fontFamily: {
        sora: ["var(--font-sora)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        jakarta: ["var(--font-jakarta)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        canvas: "#F0F4F8",
        daobg: "#F6F9FF",
        navy: {
          DEFAULT: "#0F1B35",
          deep: "#071A4A",
          darker: "#021033",
        },
        brand: {
          DEFAULT: "#155EEF",
          royal: "#005CFF",
          dark: "#0052E6",
          light: "#EEF5FF",
        },
        slate: {
          sub: "#4A5565",
          dao: "#4F6184",
          muted: "#60739A",
        },
        border: {
          figma: "#E2ECF9",
          landing: "#E2E8F0",
        },
      },
      boxShadow: {
        card: "0 4px 20px rgba(15, 23, 42, 0.04)",
        cardHover: "0 10px 30px rgba(15, 23, 42, 0.08)",
        pill: "0 2px 8px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
