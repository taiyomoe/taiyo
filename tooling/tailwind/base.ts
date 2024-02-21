import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

export default {
  darkMode: ["class"],
  content: [],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      colors: {
        background: "var(--background)",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
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
} satisfies Config
