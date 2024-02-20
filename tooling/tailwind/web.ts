import type { Config } from "tailwindcss"
import base from "./base"

export default {
  presets: [base],
  content: [
    ...base.content,
    "../../node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
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
    },
  },
  plugins: [],
} satisfies Config
