import type { CSSProperties } from "react"

/**
 * Email styling is inline styles, not classes.
 *
 * Mail clients strip or ignore stylesheets to wildly different degrees, so
 * every declaration has to travel on the element's `style` attribute. That
 * rules out the design system's StyleX tokens (which compile to classes and a
 * stylesheet), hence this small self-contained palette.
 */
export const emailColors = {
  page: "#f3f4f6",
  surface: "#ffffff",
  border: "#e5e7eb",
  primary: "#FF4F4F",
  onPrimary: "#ffffff",
  heading: "#000000",
} as const

/** Shared pieces the templates compose, so the three of them cannot drift. */
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
