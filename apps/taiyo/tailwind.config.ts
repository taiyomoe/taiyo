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
        mediasBanner: "var(--medias-banner-height)",
        mediasBannerContent: "var(--medias-banner-content-height)",
        reader: "var(--reader-height)",
        readerSidebar: "var(--reader-sidebar-width)",
        librarySidebar: "var(--library-sidebar-width)",
      },
      maxHeight: {
        navbar: "var(--navbar-height)",
        mediasBanner: "var(--medias-banner-height)",
        mediasBannerContent: "var(--medias-banner-content-height)",
        reader: "var(--reader-height)",
      },
      minHeight: {
        navbar: "var(--navbar-height)",
        mediasBanner: "var(--medias-banner-height)",
        mediasBannerContent: "var(--medias-banner-content-height)",
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
        mediaChapter: "min-content auto min-content",
        chapterCard: "auto 112px",
      },
      animation: {
        shimmer: "shimmer 8s infinite",
      },
      keyframes: {
        shimmer: {
          "0%, 90%, 100%": {
            "background-position": "calc(-100% - var(--shimmer-width)) 0",
          },
          "30%, 60%": {
            "background-position": "calc(100% + var(--shimmer-width)) 0",
          },
        },
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
      layout: {
        radius: {
          medium: "0.4rem",
          large: "0.6rem",
        },
      },
      themes: {
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
