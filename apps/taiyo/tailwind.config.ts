import { nextui } from "@nextui-org/react"
import baseConfig from "@taiyomoe/tailwind-config/base"
import tailwindScrollbar from "tailwind-scrollbar"
import type { Config } from "tailwindcss"
import plugin from "tailwindcss/plugin"

export default {
  presets: [baseConfig],
  content: [
    "./src/{app,components}/**/*.tsx",
    "../../../node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "../../node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "../node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
        "2/4": "50%",
      },
      minWidth: {
        readerSidebar: "var(--reader-sidebar-width)",
        librarySidebar: "var(--library-sidebar-width)",
        "2/4": "50%",
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
    },
  },
  plugins: [
    tailwindScrollbar({
      nocompatible: true,
      preferredStrategy: "pseudoelements",
    }),
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
} satisfies Config
