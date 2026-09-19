import * as stylex from "@stylexjs/stylex"
import type * as React from "react"
import { cn } from "@/utils/cn"
import type { Sx } from "../../styles/sx"
import { colors, consts, radius } from "../../styles/tokens.stylex"

export type AlertVariant = "default" | "error" | "info" | "success" | "warning"

const styles = stylex.create({
  base: {
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    paddingBlock: "0.75rem",
    paddingInline: "0.875rem",
    alignItems: "start",
    color: colors.cardForeground,
    columnGap: "0.5rem",
    display: "grid",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    position: "relative",
    rowGap: "0.125rem",
    width: "100%",
  },
  title: {
    fontWeight: 500,
  },
  description: {
    gap: "0.625rem",
    color: colors.mutedForeground,
    display: "flex",
    flexDirection: "column",
  },
  action: {
    gap: "0.25rem",
    alignSelf: {
      default: null,
      [consts.sm]: "center",
    },
    display: "flex",
    gridRowEnd: {
      default: null,
      [consts.sm]: "3",
    },
    gridRowStart: {
      default: null,
      [consts.sm]: "1",
    },
    marginTop: {
      default: "0.5rem",
      [consts.sm]: 0,
    },
  },
})
const variantStyles = stylex.create({
  default: {
    backgroundColor: "transparent",
  },
  error: {
    borderColor: `color-mix(in srgb, ${colors.destructive} 32%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${colors.destructive} 4%, transparent)`,
  },
  info: {
    borderColor: `color-mix(in srgb, ${colors.info} 32%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${colors.info} 4%, transparent)`,
  },
  success: {
    borderColor: `color-mix(in srgb, ${colors.success} 32%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${colors.success} 4%, transparent)`,
  },
  warning: {
    borderColor: `color-mix(in srgb, ${colors.warning} 32%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${colors.warning} 4%, transparent)`,
  },
})
const VARIANT_STYLE = {
  default: variantStyles.default,
  error: variantStyles.error,
  info: variantStyles.info,
  success: variantStyles.success,
  warning: variantStyles.warning,
} as const

export function Alert({
  className,
  variant = "default",
  sx,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: AlertVariant
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.base, VARIANT_STYLE[variant], sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-slot="alert"
      data-variant={variant}
      role="alert"
      style={styleProps.style}
      {...props}
    />
  )
}

export function AlertTitle({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.title, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-slot="alert-title"
      style={styleProps.style}
      {...props}
    />
  )
}

export function AlertDescription({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.description, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-slot="alert-description"
      style={styleProps.style}
      {...props}
    />
  )
}

export function AlertAction({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.action, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-slot="alert-action"
      style={styleProps.style}
      {...props}
    />
  )
}
