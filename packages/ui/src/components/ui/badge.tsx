"use client"

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/lib/utils"
import { colors, consts, radius } from "../../styles/tokens.stylex"
import type { Sx } from "../../styles/sx"

export type BadgeVariant =
  | "default"
  | "destructive"
  | "error"
  | "info"
  | "outline"
  | "secondary"
  | "success"
  | "warning"

export type BadgeSize = "default" | "lg" | "sm"

const styles = stylex.create({
  base: {
    borderColor: "transparent",
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.25rem",
    alignItems: "center",
    display: "inline-flex",
    flexShrink: 0,
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
    whiteSpace: "nowrap",
  },
  /**
   * The Tailwind source gated cursor/hover/tap-target on `[button&,a&]`.
   * StyleX cannot select on the tag, so interactivity is inferred from the
   * `render` prop instead (a plain span badge stays inert).
   */
  interactive: {
    cursor: "pointer",
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
/**
 * Washes for the semantic variants: the Tailwind source used an 8% tint in
 * light and a 16% tint in dark. Components cannot know the theme, so the 8%
 * wash is kept for both — on the dark charcoal stack it reads slightly
 * softer than before, which suits the design language.
 */
const variantStyles = stylex.create({
  default: {
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
  },
  destructive: {
    backgroundColor: colors.destructive,
    color: "#fff",
  },
  error: {
    backgroundColor: `color-mix(in srgb, ${colors.destructive} 8%, transparent)`,
    color: colors.destructiveForeground,
  },
  info: {
    backgroundColor: `color-mix(in srgb, ${colors.info} 8%, transparent)`,
    color: colors.infoForeground,
  },
  // The old `bg-background dark:bg-input/32` pair maps onto the raised chip
  // surface tokens (`chip`/`chipHover`), matching the outline button.
  outline: {
    borderColor: colors.input,
    backgroundClip: "padding-box",
    backgroundColor: colors.chip,
    color: colors.foreground,
  },
  secondary: {
    backgroundColor: colors.secondary,
    color: colors.secondaryForeground,
  },
  success: {
    backgroundColor: `color-mix(in srgb, ${colors.success} 8%, transparent)`,
    color: colors.successForeground,
  },
  warning: {
    backgroundColor: `color-mix(in srgb, ${colors.warning} 8%, transparent)`,
    color: colors.warningForeground,
  },
})
/** Hover feedback, only for the variants that had it — interactive badges only. */
const hoverStyles = stylex.create({
  default: {
    backgroundColor: {
      default: colors.primary,
      ":hover": `color-mix(in srgb, ${colors.primary} 90%, transparent)`,
    },
  },
  destructive: {
    backgroundColor: {
      default: colors.destructive,
      ":hover": `color-mix(in srgb, ${colors.destructive} 90%, transparent)`,
    },
  },
  outline: {
    backgroundColor: {
      default: colors.chip,
      ":hover": colors.chipHover,
    },
  },
  secondary: {
    backgroundColor: {
      default: colors.secondary,
      ":hover": `color-mix(in srgb, ${colors.secondary} 90%, transparent)`,
    },
  },
})
const sizeStyles = stylex.create({
  default: {
    paddingInline: "calc(0.5rem - 1px)",
    fontSize: {
      default: "0.875rem",
      [consts.sm]: "0.75rem",
    },
    height: {
      default: "1.375rem",
      [consts.sm]: "1.125rem",
    },
    minWidth: {
      default: "1.375rem",
      [consts.sm]: "1.125rem",
    },
  },
  lg: {
    paddingInline: "calc(0.625rem - 1px)",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    height: {
      default: "1.625rem",
      [consts.sm]: "1.375rem",
    },
    minWidth: {
      default: "1.625rem",
      [consts.sm]: "1.375rem",
    },
  },
  sm: {
    paddingInline: "calc(0.375rem - 1px)",
    fontSize: {
      default: "0.75rem",
      [consts.sm]: "0.625rem",
    },
    height: {
      default: "1.25rem",
      [consts.sm]: "1rem",
    },
    minWidth: {
      default: "1.25rem",
      [consts.sm]: "1rem",
    },
  },
})
const VARIANT_STYLE = {
  default: variantStyles.default,
  destructive: variantStyles.destructive,
  error: variantStyles.error,
  info: variantStyles.info,
  outline: variantStyles.outline,
  secondary: variantStyles.secondary,
  success: variantStyles.success,
  warning: variantStyles.warning,
} as const
const HOVER_STYLE: Partial<Record<BadgeVariant, stylex.StyleXStyles>> = {
  default: hoverStyles.default,
  destructive: hoverStyles.destructive,
  outline: hoverStyles.outline,
  secondary: hoverStyles.secondary,
}
const SIZE_STYLE = {
  default: sizeStyles.default,
  lg: sizeStyles.lg,
  sm: sizeStyles.sm,
} as const

export interface BadgeStyleOptions {
  variant?: BadgeVariant | null
  size?: BadgeSize | null
  className?: string
}

/**
 * Legacy escape hatch, kept API-compatible with the old cva export: returns
 * the compiled class string for callers that style a foreign element as a
 * badge. The interactive (hover/tap-target) styles are always included here
 * because manual callers style buttons and links. Prefer `sx` composition.
 */
export function badgeVariants({
  variant = "default",
  size = "default",
  className,
}: BadgeStyleOptions = {}): string {
  const resolvedVariant: BadgeVariant = variant ?? "default"
  const props = stylex.props(
    styles.base,
    VARIANT_STYLE[resolvedVariant],
    SIZE_STYLE[size ?? "default"],
    styles.interactive,
    HOVER_STYLE[resolvedVariant],
  )

  return cn(props.className, className)
}

export interface BadgeProps extends useRender.ComponentProps<"span"> {
  variant?: BadgeVariant
  size?: BadgeSize
  sx?: Sx
}

export function Badge({
  className,
  variant = "default",
  size = "default",
  render,
  sx,
  ...props
}: BadgeProps): React.ReactElement {
  const interactive: boolean = Boolean(render)
  const styleProps = stylex.props(
    styles.base,
    VARIANT_STYLE[variant],
    SIZE_STYLE[size],
    interactive && styles.interactive,
    interactive && HOVER_STYLE[variant],
    sx,
  )
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "badge",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(defaultProps, props),
    render,
  })
}
