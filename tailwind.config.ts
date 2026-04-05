import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: "hsl(var(--card) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        primary: "hsl(var(--primary) / <alpha-value>)",
        secondary: "hsl(var(--secondary) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        success: "hsl(var(--success) / <alpha-value>)",
        warning: "hsl(var(--warning) / <alpha-value>)",
        danger: "hsl(var(--danger) / <alpha-value>)",
        sage: {
          50: "#f8faf8",
          100: "#e8f0e9",
          200: "#c8deca",
          300: "#a0c5a3",
          400: "#72a876",
          500: "#4e8c53",
          600: "#3a7040",
          700: "#2e5933",
          800: "#244428",
          900: "#1a321e",
        },
        dark: {
          50: "#1a1a1a",
          100: "#161616",
          200: "#111111",
          300: "#0a0a0a",
          400: "#080808",
          500: "#050505",
        },
        accentLegacy: {
          400: "#e53935",
          500: "#d32f2f",
          600: "#b71c1c",
        },
      },
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-jakarta)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
