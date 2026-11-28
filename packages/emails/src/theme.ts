import type { CSSProperties } from "react"

// The landing page's scene palette (@taiyomoe/ui/styles/scene.stylex): a sunrise over the night.
export const emailColors = {
  night: "#120a07",
  paper: "#fffcf8",
  ink: "#2a1208",
  muted: "#75655c",
  rule: "#efe5da",
  dusk: "#a08f84",
  brand: "#f2452d",
  onBrand: "#ffffff",
} as const

// PT Serif and Inter where the client loads web fonts (Apple Mail, iOS), close system fonts
// everywhere else.
export const emailFonts = {
  display: "'PT Serif', Georgia, 'Times New Roman', serif",
  sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
} as const

export const emailStyles = {
  title: {
    color: emailColors.ink,
    fontFamily: emailFonts.display,
    fontSize: "28px",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    lineHeight: "34px",
    margin: "0 0 16px",
  },
  text: {
    color: emailColors.ink,
    fontFamily: emailFonts.sans,
    fontSize: "15px",
    lineHeight: "24px",
    margin: "0 0 16px",
  },
  small: {
    color: emailColors.muted,
    fontFamily: emailFonts.sans,
    fontSize: "13px",
    lineHeight: "20px",
    margin: 0,
  },
  link: {
    color: emailColors.brand,
    wordBreak: "break-all",
  },
} satisfies Record<string, CSSProperties>
