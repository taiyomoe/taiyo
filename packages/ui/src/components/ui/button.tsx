"use client"

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type * as React from "react"
import { cn } from "@/utils/cn"
import { Spinner } from "@/components/ui/spinner"
import { colors, consts, radius, shadows } from "../../styles/tokens.stylex"
import type { Sx } from "../../styles/sx"

export type ButtonVariant =
  | "default"
  | "destructive"
  | "destructive-outline"
  | "ghost"
  | "link"
  | "outline"
  | "secondary"

export type ButtonSize =
  | "default"
  | "icon"
  | "icon-lg"
  | "icon-sm"
  | "icon-xl"
  | "icon-xs"
  | "lg"
  | "sm"
  | "xl"
  | "xs"

const styles = stylex.create({
  base: {
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.5rem",
    alignItems: "center",
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
  loading: {
    color: "transparent",
    userSelect: "none",
  },
  spinnerWrap: {
    pointerEvents: "none",
    position: "absolute",
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
    borderColor: colors.primary,
    backgroundColor: {
      "[data-pressed]": `color-mix(in srgb, ${colors.primary} 90%, transparent)`,
      default: colors.primary,
      ":hover": `color-mix(in srgb, ${colors.primary} 90%, transparent)`,
    },
    boxShadow: {
      "[data-pressed]": shadows.pressed,
      default: `${shadows.emboss}, 0 1px 2px 0 color-mix(in srgb, ${colors.primary} 24%, transparent)`,
      ":disabled": "none",
      ":active": shadows.pressed,
    },
    color: colors.primaryForeground,
  },
  destructive: {
    borderColor: colors.destructive,
    backgroundColor: {
      "[data-pressed]": `color-mix(in srgb, ${colors.destructive} 90%, transparent)`,
      default: colors.destructive,
      ":hover": `color-mix(in srgb, ${colors.destructive} 90%, transparent)`,
    },
    boxShadow: {
      "[data-pressed]": shadows.pressed,
      default: `${shadows.emboss}, 0 1px 2px 0 color-mix(in srgb, ${colors.destructive} 24%, transparent)`,
      ":disabled": "none",
      ":active": shadows.pressed,
    },
    color: "#fff",
  },
  destructiveOutline: {
    borderColor: {
      "[data-pressed]": `color-mix(in srgb, ${colors.destructive} 32%, transparent)`,
      default: colors.input,
      ":hover": `color-mix(in srgb, ${colors.destructive} 32%, transparent)`,
    },
    backgroundClip: "padding-box",
    backgroundColor: {
      "[data-pressed]": `color-mix(in srgb, ${colors.destructive} 4%, transparent)`,
      default: colors.chip,
      ":hover": `color-mix(in srgb, ${colors.destructive} 4%, transparent)`,
    },
    boxShadow: {
      "[data-pressed]": "none",
      default: "0 1px 2px 0 rgb(0 0 0 / 5%)",
      ":disabled": "none",
      ":active": "none",
    },
    color: colors.destructiveForeground,
  },
  ghost: {
    borderColor: "transparent",
    backgroundColor: {
      "[data-pressed]": colors.accent,
      default: "transparent",
      ":hover": colors.accent,
    },
    color: colors.foreground,
  },
  link: {
    borderColor: "transparent",
    backgroundColor: "transparent",
    color: colors.foreground,
    textDecorationLine: {
      "[data-pressed]": "underline",
      default: "none",
      ":hover": "underline",
    },
    textUnderlineOffset: 4,
  },
  outline: {
    borderColor: colors.input,
    backgroundClip: "padding-box",
    backgroundColor: {
      "[data-pressed]": colors.chipHover,
      default: colors.chip,
      ":hover": colors.chipHover,
    },
    boxShadow: {
      "[data-pressed]": "none",
      default: "0 1px 2px 0 rgb(0 0 0 / 5%)",
      ":disabled": "none",
      ":active": "none",
    },
    color: colors.foreground,
  },
  secondary: {
    borderColor: "transparent",
    backgroundColor: {
      "[data-pressed]": `color-mix(in srgb, ${colors.secondary} 80%, transparent)`,
      default: colors.secondary,
      ":hover": `color-mix(in srgb, ${colors.secondary} 90%, transparent)`,
      ":active": `color-mix(in srgb, ${colors.secondary} 80%, transparent)`,
    },
    color: colors.secondaryForeground,
  },
})
const sizeStyles = stylex.create({
  default: {
    paddingInline: "calc(1rem - 1px)",
    height: {
      default: "2.25rem",
      [consts.sm]: "2rem",
    },
  },
  icon: {
    height: {
      default: "2.25rem",
      [consts.sm]: "2rem",
    },
    width: {
      default: "2.25rem",
      [consts.sm]: "2rem",
    },
  },
  iconLg: {
    height: {
      default: "2.5rem",
      [consts.sm]: "2.25rem",
    },
    width: {
      default: "2.5rem",
      [consts.sm]: "2.25rem",
    },
  },
  iconSm: {
    height: {
      default: "2rem",
      [consts.sm]: "1.75rem",
    },
    width: {
      default: "2rem",
      [consts.sm]: "1.75rem",
    },
  },
  iconXl: {
    height: {
      default: "2.75rem",
      [consts.sm]: "2.5rem",
    },
    width: {
      default: "2.75rem",
      [consts.sm]: "2.5rem",
    },
  },
  iconXs: {
    height: {
      default: "1.75rem",
      [consts.sm]: "1.5rem",
    },
    width: {
      default: "1.75rem",
      [consts.sm]: "1.5rem",
    },
  },
  lg: {
    paddingInline: "calc(1.125rem - 1px)",
    height: {
      default: "2.5rem",
      [consts.sm]: "2.25rem",
    },
  },
  sm: {
    gap: "0.375rem",
    paddingInline: "calc(0.75rem - 1px)",
    height: {
      default: "2rem",
      [consts.sm]: "1.75rem",
    },
  },
  xl: {
    paddingInline: "calc(1.25rem - 1px)",
    fontSize: {
      default: "1.125rem",
      [consts.sm]: "1rem",
    },
    height: {
      default: "2.75rem",
      [consts.sm]: "2.5rem",
    },
  },
  xs: {
    gap: "0.25rem",
    paddingInline: "calc(0.625rem - 1px)",
    fontSize: {
      default: "0.875rem",
      [consts.sm]: "0.75rem",
    },
    height: {
      default: "1.75rem",
      [consts.sm]: "1.5rem",
    },
  },
})
const spinnerColor = stylex.create({
  default: { color: colors.primaryForeground },
  destructive: { color: "#fff" },
  foreground: { color: colors.foreground },
  secondary: { color: colors.secondaryForeground },
})
const VARIANT_STYLE = {
  default: variantStyles.default,
  destructive: variantStyles.destructive,
  "destructive-outline": variantStyles.destructiveOutline,
  ghost: variantStyles.ghost,
  link: variantStyles.link,
  outline: variantStyles.outline,
  secondary: variantStyles.secondary,
} as const
const SIZE_STYLE = {
  default: sizeStyles.default,
  icon: sizeStyles.icon,
  "icon-lg": sizeStyles.iconLg,
  "icon-sm": sizeStyles.iconSm,
  "icon-xl": sizeStyles.iconXl,
  "icon-xs": sizeStyles.iconXs,
  lg: sizeStyles.lg,
  sm: sizeStyles.sm,
  xl: sizeStyles.xl,
  xs: sizeStyles.xs,
} as const
const SPINNER_COLOR = {
  default: spinnerColor.default,
  destructive: spinnerColor.destructive,
  "destructive-outline": spinnerColor.foreground,
  ghost: spinnerColor.foreground,
  link: spinnerColor.foreground,
  outline: spinnerColor.foreground,
  secondary: spinnerColor.secondary,
} as const
/** Variants that draw the raised chip edge on their ::before layer. */
const EDGE_VARIANTS: ReadonlySet<ButtonVariant> = new Set(["destructive-outline", "outline"])

export interface ButtonStyleOptions {
  variant?: ButtonVariant | null
  size?: ButtonSize | null
  className?: string
}

/**
 * Legacy escape hatch, kept API-compatible with the old cva export: returns
 * the compiled class string for callers that style a foreign element as a
 * button (e.g. ToolbarLink). Prefer `sx` composition where possible.
 */
export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: ButtonStyleOptions = {}): string {
  const resolvedVariant: ButtonVariant = variant ?? "default"
  const props = stylex.props(
    styles.base,
    VARIANT_STYLE[resolvedVariant],
    SIZE_STYLE[size ?? "default"],
    EDGE_VARIANTS.has(resolvedVariant) && raised.before,
  )

  return cn(props.className, className)
}

export interface ButtonProps extends useRender.ComponentProps<"button"> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  sx?: Sx
}

export function Button({
  className,
  variant = "default",
  size = "default",
  render,
  children,
  loading = false,
  disabled: disabledProp,
  sx,
  ...props
}: ButtonProps): React.ReactElement {
  const isDisabled: boolean = Boolean(loading || disabledProp)
  const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] = render
    ? undefined
    : "button"
  const styleProps = stylex.props(
    styles.base,
    VARIANT_STYLE[variant],
    SIZE_STYLE[size],
    EDGE_VARIANTS.has(variant) && raised.before,
    loading && styles.loading,
    sx,
  )
  const defaultProps = {
    children: (
      <>
        {children}
        {loading && (
          <span
            sx={[styles.spinnerWrap, SPINNER_COLOR[variant]]}
            data-slot="button-loading-indicator"
          >
            <Spinner />
          </span>
        )}
      </>
    ),
    className: cn(styleProps.className, className),
    style: styleProps.style,
    "aria-disabled": loading || undefined,
    "data-loading": loading ? "" : undefined,
    "data-size": size,
    "data-slot": "button",
    disabled: isDisabled,
    type: typeValue,
  }

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(defaultProps, props),
    render,
  })
}
