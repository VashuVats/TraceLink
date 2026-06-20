import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1B1F27", // dark chrome / evidence room walls
          900: "#14171D",
          800: "#1B1F27",
          700: "#242A35",
          600: "#2C313B",
          500: "#3A4150",
        },
        paper: {
          DEFAULT: "#EFE6D3", // manila/kraft case-folder surface
          light: "#F7F2E7",
          dark: "#E2D6B8",
        },
        tag: {
          // evidence-tag red — the one signature accent
          DEFAULT: "#C23B3B",
          dark: "#9A2E2E",
          light: "#E2A0A0",
        },
        resolved: {
          DEFAULT: "#5C8A6B",
          dark: "#456B51",
        },
        muted: "#6B6457",
      },
      fontFamily: {
        display: ["Georgia", "Iowan Old Style", "Times New Roman", "serif"],
        body: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SF Mono",
          "Roboto Mono",
          "Menlo",
          "monospace",
        ],
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "4px",
        md: "6px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.06), 0 1px 0 rgba(0,0,0,0.04)",
        stamp: "0 0 0 1px currentColor inset",
      },
    },
  },
  plugins: [],
};

export default config;
