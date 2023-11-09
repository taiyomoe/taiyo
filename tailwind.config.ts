import { nextui } from "@nextui-org/theme";
import tailwindScrollbar from "tailwind-scrollbar";
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
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
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      maxHeight: {
        reader: "calc(100vh - var(--navbar-height))",
      },
      minHeight: {
        reader: "calc(100vh - var(--navbar-height))",
      },
      height: {
        reader: "calc(100vh - var(--navbar-height))",
      },
      blur: {
        xs: "3px",
      },
      boxShadow: {
        intense: "12px 25px 100px 62px #000",
      },
      gridTemplateAreas: {
        mediaChapter: ["leftSidebar chapter rightSidebar"],
      },
      gridTemplateColumns: {
        smChapterLayout: "auto 50px 70px",
        mdChapterLayout: "auto 130px 70px",
        lgMediaLayout: "350px auto",
        xlMediaLayout: "420px auto",
        "2xlMediaLayout": "550px auto",
        mediaChapter: "min-content auto min-content",
      },
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
  plugins: [
    tailwindScrollbar({ nocompatible: true }),
    plugin(({ addVariant }) => {
      addVariant("child", "& > *");
      addVariant("child-hover", "& > *:hover");
    }),
    require("@savvywombat/tailwindcss-grid-areas"),
    nextui({
      addCommonColors: true,
      themes: {
        light: {
          colors: {
            background: "#f0f0f5",
            foreground: "hsl(0 0% 3.9%)",
            content1: {
              DEFAULT: "#fff",
              foreground: "hsl(0 0% 3.9%)",
            },
            primary: {
              DEFAULT: "#ff4f4f",
              foreground: "hsl(0 0% 98%)",
            },
            secondary: {
              DEFAULT: "#383842",
              foreground: "hsl(0 0% 9%)",
            },
          },
        },
        dark: {
          colors: {
            background: "#16161a",
            foreground: "hsl(0 0% 98%)",
            content1: {
              DEFAULT: "#26262d",
              foreground: "hsl(0 0% 98%)",
            },
            primary: {
              DEFAULT: "#ff4f4f",
              foreground: "hsl(0 0% 98%)",
            },
            secondary: {
              DEFAULT: "#383842",
              foreground: "hsl(0 0% 98%)",
            },
          },
        },
      },
    }),
  ],
} satisfies Config;
