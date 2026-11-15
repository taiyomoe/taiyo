import type React from "react"
import { Field as FieldPrimitive } from "@base-ui/react/field"
import * as stylex from "@stylexjs/stylex"
import type { Sx } from "../../styles/sx"
import { breakpoints, colors } from "../../styles/tokens.stylex"
import { cn } from "../../utils/cn"

const styles = stylex.create({
  root: {
    gap: "0.5rem",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.foreground,
    display: "inline-flex",
    fontSize: {
      default: "1rem",
      [breakpoints.sm]: "0.875rem",
    },
    fontWeight: 500,
    lineHeight: {
      default: "1.125rem",
      [breakpoints.sm]: "1rem",
    },
    opacity: {
      "[data-disabled]": 0.64,
      default: 1,
    },
  },
  item: {
    display: "flex",
  },
  description: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    lineHeight: "1rem",
  },
  error: {
    color: colors.destructiveForeground,
    fontSize: "0.75rem",
    lineHeight: "1rem",
  },
})

export function Field({
  className,
  sx,
  ...props
}: FieldPrimitive.Root.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.root, sx)

  return (
    <FieldPrimitive.Root
      className={cn(styleProps.className, className)}
      data-slot="field"
      style={styleProps.style}
      {...props}
    />
  )
}

export function FieldLabel({
  className,
  sx,
  ...props
}: FieldPrimitive.Label.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.label, sx)

  return (
    <FieldPrimitive.Label
      className={cn(styleProps.className, className)}
      data-slot="field-label"
      style={styleProps.style}
      {...props}
    />
  )
}

export function FieldItem({
  className,
  sx,
  ...props
}: FieldPrimitive.Item.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.item, sx)

  return (
    <FieldPrimitive.Item
      className={cn(styleProps.className, className)}
      data-slot="field-item"
      style={styleProps.style}
      {...props}
    />
  )
}

export function FieldDescription({
  className,
  sx,
  ...props
}: FieldPrimitive.Description.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.description, sx)

  return (
    <FieldPrimitive.Description
      className={cn(styleProps.className, className)}
      data-slot="field-description"
      style={styleProps.style}
      {...props}
    />
  )
}

export function FieldError({
  className,
  sx,
  ...props
}: FieldPrimitive.Error.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.error, sx)

  return (
    <FieldPrimitive.Error
      className={cn(styleProps.className, className)}
      data-slot="field-error"
      style={styleProps.style}
      {...props}
    />
  )
}

export const FieldControl: typeof FieldPrimitive.Control = FieldPrimitive.Control

export const FieldValidity: typeof FieldPrimitive.Validity = FieldPrimitive.Validity

export { FieldPrimitive }
