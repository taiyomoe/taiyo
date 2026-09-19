"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/utils/cn"
import { colors, consts, radius, shadows } from "../../styles/tokens.stylex"
import { focus, tap } from "../../styles/recipes"
import type { Sx } from "../../styles/sx"

export type ToggleVariant = "default" | "outline"

export type ToggleSize = "default" | "lg" | "sm"

const styles = stylex.create({
  base: {
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.5rem",
    alignItems: "center",
    backgroundColor: {
      "[data-pressed]": colors.input,
      default: "transparent",
      ":hover": colors.accent,
    },
    color: {
      "[data-pressed]": colors.accentForeground,
      default: colors.foreground,
    },
    cursor: "pointer",
    display: "inline-flex",
    flexShrink: 0,
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    fontWeight: 500,
    justifyContent: "center",
    opacity: {
      default: 1,
      ":disabled": 0.64,
    },
    pointerEvents: {
      default: null,
      ":disabled": "none",
    },
    position: "relative",
    transitionProperty: "box-shadow, background-color, border-color",
    userSelect: "none",
    whiteSpace: "nowrap",
  },
})
const raised = stylex.create({
  before: {
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: {
        "[data-pressed]": "none",
        default: shadows.edge,
        ":disabled": "none",
        ":active": "none",
      },
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
})
const variantStyles = stylex.create({
  default: {
    borderColor: "transparent",
  },
  outline: {
    borderColor: colors.input,
    backgroundClip: "padding-box",
    backgroundColor: {
      "[data-pressed]": colors.input,
      default: colors.chip,
      ":hover": colors.chipHover,
    },
    boxShadow: {
      "[data-pressed]": "none",
      default: shadows.chip,
      ":disabled": "none",
      ":active": "none",
    },
  },
})
const sizeStyles = stylex.create({
  default: {
    paddingInline: "calc(0.5rem - 1px)",
    height: {
      default: "2.25rem",
      [consts.sm]: "2rem",
    },
    minWidth: {
      default: "2.25rem",
      [consts.sm]: "2rem",
    },
  },
  lg: {
    paddingInline: "calc(0.625rem - 1px)",
    height: {
      default: "2.5rem",
      [consts.sm]: "2.25rem",
    },
    minWidth: {
      default: "2.5rem",
      [consts.sm]: "2.25rem",
    },
  },
  sm: {
    paddingInline: "calc(0.375rem - 1px)",
    height: {
      default: "2rem",
      [consts.sm]: "1.75rem",
    },
    minWidth: {
      default: "2rem",
      [consts.sm]: "1.75rem",
    },
  },
})
const VARIANT_STYLE = {
  default: variantStyles.default,
  outline: variantStyles.outline,
} as const
const SIZE_STYLE = {
  default: sizeStyles.default,
  lg: sizeStyles.lg,
  sm: sizeStyles.sm,
} as const

export interface ToggleProps extends TogglePrimitive.Props {
  variant?: ToggleVariant
  size?: ToggleSize
  sx?: Sx
}

export function Toggle({
  className,
  variant = "default",
  size = "default",
  sx,
  ...props
}: ToggleProps): React.ReactElement {
  const styleProps = stylex.props(
    tap.target,
    focus.control,
    styles.base,
    VARIANT_STYLE[variant],
    SIZE_STYLE[size],
    variant === "outline" && raised.before,
    sx,
  )

  return (
    <TogglePrimitive
      className={cn(styleProps.className, className)}
      data-slot="toggle"
      style={styleProps.style}
      {...props}
    />
  )
}

export { TogglePrimitive }
