import { nextui } from "@nextui-org/theme"
import tailwindScrollbar from "tailwind-scrollbar"
import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"
import plugin from "tailwindcss/plugin"
import baseConfig from "@taiyomoe/tailwind-config/web"

export default ({
  content: [...baseConfig.content, "../../packages/ui/**/*.{ts,tsx}"],
  presets: [baseConfig],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...fontFamily.mono],
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
