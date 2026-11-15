import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"

const styles = stylex.create({
  button: {
    borderColor: "rgb(255 255 255 / 12%)",
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.5rem",
    paddingInline: "0.875rem",
    alignItems: "center",
    backdropFilter: "blur(12px)",
    backgroundColor: {
      default: "rgb(28 28 28 / 72%)",
      ":disabled": "rgb(28 28 28 / 40%)",
      ":hover": "rgb(52 52 52 / 82%)",
    },
    boxShadow: "inset 0 1px rgb(255 255 255 / 8%), 0 8px 24px -8px rgb(0 0 0 / 60%)",
    color: { default: "rgb(255 255 255 / 92%)", ":disabled": "rgb(255 255 255 / 40%)" },
    cursor: { default: "pointer", ":disabled": "default" },
    display: "inline-flex",
    flexShrink: 0,
    fontSize: "0.875rem",
    fontWeight: 500,
    justifyContent: "center",
    outlineColor: "rgb(255 255 255 / 80%)",
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    transitionDuration: motion.enter,
    transitionProperty: "background-color, color, transform",
    transitionTimingFunction: motion.easeOut,
    height: "2.5rem",
  },
  icon: {
    paddingInline: 0,
    width: "2.5rem",
  },
  large: {
    height: "3rem",
    width: "3rem",
  },
})

export function OverlayButton({
  label,
  children,
  iconOnly = false,
  large = false,
  disabled = false,
  onClick,
  sx,
}: {
  label: string
  children: ReactNode
  iconOnly?: boolean
  large?: boolean
  disabled?: boolean
  onClick: () => void
  sx?: Sx
}) {
  return (
    <button
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      sx={[styles.button, iconOnly && styles.icon, large && styles.large, sx]}
      title={iconOnly ? label : undefined}
      type="button"
    >
      {children}
    </button>
  )
}
