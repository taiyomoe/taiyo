import { nextui } from "@nextui-org/theme";
import type { Config } from "tailwindcss";

import baseConfig from "@taiyo/tailwind-config";

export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [baseConfig],
  theme: {
    gridTemplateColumns: {
      lgMediaLayout: "350px auto",
      xlMediaLayout: "420px auto",
      "2xlMediaLayout": "550px auto",
    },
  },
  plugins: [
    require("tailwind-scrollbar"),
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
              foreground: "hsl(0 0% 9%)",
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
