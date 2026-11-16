import type { CSSProperties } from "react"

// The light theme of @taiyomoe/ui, in hex: email clients do not read oklch().
export const emailColors = {
  page: "#ececec",
  surface: "#fdfdfd",
  border: "#e2e2e2",
  text: "#171717",
  muted: "#5d5d5d",
  primary: "#f2452d",
  onPrimary: "#ffffff",
} as const

// Inter where the client loads web fonts (Apple Mail, iOS), the system font everywhere else.
export const emailFont =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

export const emailStyles = {
  title: {
    color: emailColors.text,
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    lineHeight: "30px",
    margin: "0 0 12px",
  },
  text: {
    color: emailColors.text,
    fontSize: "15px",
    lineHeight: "24px",
    margin: "0 0 16px",
  },
  small: {
    color: emailColors.muted,
    fontSize: "13px",
    lineHeight: "20px",
    margin: 0,
  },
  link: {
    color: emailColors.primary,
    wordBreak: "break-all",
  },
} satisfies Record<string, CSSProperties>
