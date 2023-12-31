import { nextui } from "@nextui-org/theme"
import tailwindScrollbar from "tailwind-scrollbar"
import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"
import plugin from "tailwindcss/plugin"

export default ({
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
      spacing: {
        bodyPadding: "var(--body-padding)",
        navbar: "var(--navbar-height)",
        reader: "var(--reader-height)",
        readerSidebar: "var(--reader-sidebar-width)",
        librarySidebar: "var(--library-sidebar-width)",
      },
      maxHeight: {
        navbar: "var(--navbar-height)",
        reader: "var(--reader-height)",
      },
      minHeight: {
        navbar: "var(--navbar-height)",
        reader: "var(--reader-height)",
      },
      maxWidth: {
        readerSidebar: "var(--reader-sidebar-width)",
        librarySidebar: "var(--library-sidebar-width)",
      },
      minWidth: {
        readerSidebar: "var(--reader-sidebar-width)",
        librarySidebar: "var(--library-sidebar-width)",
      },
      blur: {
        xs: "3px",
      },
      boxShadow: {
        intense: "12px 25px 100px 62px #000",
      },
      dropShadow: {
        accent: "0 1.2px 1.2px rgba(0,0,0,0.8)",
      },
      gridTemplateAreas: {
        mediaChapter: ["leftSidebar chapter rightSidebar"],
      },
      gridTemplateColumns: {
        smChapterLayout: "auto 50px 70px",
        mdChapterLayout: "auto 130px 70px",
        mediaChapter: "min-content auto min-content",
      },
      animation: {
        "spin-medium": "spin 2s linear infinite",
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
  plugins: [
    tailwindScrollbar({ nocompatible: true }),
    plugin(({ addVariant }) => {
      addVariant("child", "& > *")
      addVariant("child-hover", "& > *:hover")
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
              DEFAULT: "#ececee",
              foreground: "hsl(0 0% 3.9%)",
            },
            content2: {
              DEFAULT: "#dfdfe2",
              foreground: "hsl(0 0% 3.9%)",
            },
            primary: {
              DEFAULT: "hsl(0 100% 65.49%)",
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
              DEFAULT: "#2d2d30",
              foreground: "hsl(0 0% 98%)",
            },
            content2: {
              DEFAULT: "#37373b",
              foreground: "hsl(0 0% 98%)",
            },
            primary: {
              DEFAULT: "hsl(0 100% 65.49%)",
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
} satisfies Config)
