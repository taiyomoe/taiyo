"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/lib/utils"
import { colors, consts, radius, shadows } from "../../styles/tokens.stylex"
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
      "[data-pressed]": `color-mix(in srgb, ${colors.input} 64%, transparent)`,
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
    outlineColor: colors.ring,
    outlineOffset: 1,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
    pointerEvents: {
      default: null,
      ":disabled": "none",
    },
    position: "relative",
    transitionProperty: "box-shadow, background-color, border-color",
    userSelect: "none",
    whiteSpace: "nowrap",
    "::after": {
      content: {
        default: "none",
        [consts.pointerCoarse]: '""',
      },
      position: "absolute",
      height: "100%",
      minHeight: "2.75rem",
      minWidth: "2.75rem",
      width: "100%",
    },
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
  // The old `bg-background dark:bg-input/32` surface maps onto the raised
  // chip tokens (`chip`/`chipHover`), matching the outline button. The dark
  // pressed `bg-input` deepens to the theme-agnostic `input` wash.
  outline: {
    borderColor: colors.input,
    backgroundClip: "padding-box",
    backgroundColor: {
      "[data-pressed]": `color-mix(in srgb, ${colors.input} 64%, transparent)`,
      default: colors.chip,
      ":hover": colors.chipHover,
    },
    boxShadow: {
      "[data-pressed]": "none",
      default: "0 1px 2px 0 rgb(0 0 0 / 5%)",
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

export interface ToggleStyleOptions {
  variant?: ToggleVariant | null
  size?: ToggleSize | null
  className?: string
}

/**
 * Legacy escape hatch, kept API-compatible with the old cva export: returns
 * the compiled class string for callers that style a foreign element as a
 * toggle. Prefer `sx` composition where possible.
 */
export function toggleVariants({
  variant = "default",
  size = "default",
  className,
}: ToggleStyleOptions = {}): string {
  const resolvedVariant: ToggleVariant = variant ?? "default"
  const props = stylex.props(
    styles.base,
    VARIANT_STYLE[resolvedVariant],
    SIZE_STYLE[size ?? "default"],
    resolvedVariant === "outline" && raised.before,
  )

  return cn(props.className, className)
}

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
