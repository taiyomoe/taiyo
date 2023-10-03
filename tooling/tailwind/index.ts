import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "hsl(var(--secondary-foreground))",
        },
        content1: {
          DEFAULT: "var(--content1)",
          foreground: "hsl(var(--content1-foreground))",
        },
        discord: {
          DEFAULT: "var(--discord)",
          foreground: "var(--discord-foreground)",
        },
        google: {
          DEFAULT: "var(--google)",
          foreground: "var(--google-foreground)",
        },
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
} satisfies Config;
