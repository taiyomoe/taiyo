import type { CSSProperties } from "react"

export const emailColors = {
  page: "#f3f4f6",
  surface: "#ffffff",
  border: "#e5e7eb",
  primary: "#FF4F4F",
  onPrimary: "#ffffff",
  heading: "#000000",
} as const

export const emailStyles = {
  body: {
    padding: "16px 32px",
  },
  title: {
    fontSize: "24px",
    fontWeight: 700,
    lineHeight: "32px",
  },
  button: {
    backgroundColor: emailColors.primary,
    borderRadius: "6px",
    color: emailColors.onPrimary,
    display: "inline-block",
    fontSize: "14px",
    lineHeight: "20px",
    padding: "6px 12px",
  },
  footer: {
    borderTop: `1px solid ${emailColors.border}`,
    padding: "0 32px",
  },
} satisfies Record<string, CSSProperties>
