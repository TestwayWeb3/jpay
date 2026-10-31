import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/providers/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(7 6 13 / <alpha-value>)",
        foreground: "rgb(244 242 255 / <alpha-value>)",
        surface: "rgb(13 11 22 / <alpha-value>)",
        "surface-strong": "rgb(20 17 31 / <alpha-value>)",
        muted: "rgb(155 147 184 / <alpha-value>)",
        monad: {
          DEFAULT: "#6E54FF",
          50: "#F2EFFF",
          100: "#E5DFFF",
          200: "#CCC1FF",
          300: "#B3A3FF",
          400: "#9A86FF",
          500: "#6E54FF",
          600: "#5B3FE6",
          700: "#4A31BF",
          800: "#382599",
          900: "#271A73",
          950: "#160E42",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(110, 84, 255, 0.35), 0 18px 60px -20px rgba(110, 84, 255, 0.65)",
        card: "0 24px 70px -35px rgba(0, 0, 0, 0.9)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        "splash-logo": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "splash-glow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(0.95)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        "splash-logo": "splash-logo 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
        "splash-text": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both",
        "splash-glow": "splash-glow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
