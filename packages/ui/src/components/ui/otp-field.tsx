"use client"

import { OTPField as OTPFieldPrimitive } from "@base-ui/react/otp-field"
import * as React from "react"
import * as stylex from "@stylexjs/stylex"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import type { Sx } from "../../styles/sx"
import { colors, consts, radius, shadows } from "../../styles/tokens.stylex"

export type OTPFieldSize = "default" | "lg"

const styles = stylex.create({
  root: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
  },
  rootDisabled: {
    opacity: 0.64,
  },
  input: {
    borderColor: {
      "[aria-invalid]": `color-mix(in srgb, ${colors.destructive} 36%, transparent)`,
      default: colors.input,
      ":focus-visible": colors.ring,
    },
    // The chip rule (radius ~= 0.35x the height) was measured on a WIDE chip;
    // on a square slot the same ratio reads as a bubble rather than a field.
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.field,
    boxShadow: {
      "[aria-invalid]": "none",
      default: "0 1px 2px 0 rgb(0 0 0 / 5%)",
      ":focus-visible": "none",
    },
    color: colors.foreground,
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    lineHeight: {
      default: "2.25rem",
      [consts.sm]: "2rem",
    },
    outlineColor: `color-mix(in srgb, ${colors.ring} 24%, transparent)`,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 3,
    position: "relative",
    textAlign: "center",
    transitionProperty: "box-shadow, border-color",
    zIndex: {
      default: null,
      ":focus-visible": 10,
    },
    height: {
      default: "2.25rem",
      [consts.sm]: "2rem",
    },
    minWidth: 0,
    width: {
      default: "2.25rem",
      [consts.sm]: "2rem",
    },
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: {
        default: shadows.edge,
        ":focus-visible": "none",
      },
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
  inputLg: {
    fontSize: {
      default: "1.125rem",
      [consts.sm]: "1rem",
    },
    lineHeight: {
      default: "2.5rem",
      [consts.sm]: "2.25rem",
    },
    height: {
      default: "2.5rem",
      [consts.sm]: "2.25rem",
    },
    width: {
      default: "2.5rem",
      [consts.sm]: "2.25rem",
    },
  },
  inputInvalid: {
    borderColor: {
      default: `color-mix(in srgb, ${colors.destructive} 36%, transparent)`,
      ":focus-visible": `color-mix(in srgb, ${colors.destructive} 64%, transparent)`,
    },
    outlineColor: `color-mix(in srgb, ${colors.destructive} 16%, transparent)`,
  },
  separator: {
    borderRadius: radius.full,
    backgroundColor: colors.input,
    height: "0.125rem",
    width: "0.75rem",
  },
})
/**
 * The `size` prop is read by every cell, so it is published on the root and
 * consumed through a context rather than the Tailwind `in-[…]` ancestor
 * selectors the original used.
 */
const OTPFieldSizeContext = React.createContext<OTPFieldSize>("default")

export function OTPField({
  className,
  size = "default",
  sx,
  ...props
}: React.ComponentProps<typeof OTPFieldPrimitive.Root> & {
  size?: OTPFieldSize
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.root, props.disabled === true && styles.rootDisabled, sx)

  return (
    <OTPFieldSizeContext value={size}>
      <OTPFieldPrimitive.Root
        className={cn(styleProps.className, className)}
        data-size={size}
        data-slot="otp-field"
        style={styleProps.style}
        {...props}
      />
    </OTPFieldSizeContext>
  )
}

export function OTPFieldInput({
  className,
  sx,
  ...props
}: React.ComponentProps<typeof OTPFieldPrimitive.Input> & { sx?: Sx }): React.ReactElement {
  const size = React.useContext(OTPFieldSizeContext)
  const styleProps = stylex.props(
    styles.input,
    size === "lg" && styles.inputLg,
    props["aria-invalid"] !== undefined && styles.inputInvalid,
    sx,
  )

  return (
    <OTPFieldPrimitive.Input
      className={cn(styleProps.className, className)}
      data-slot="otp-field-input"
      spellCheck={false}
      style={styleProps.style}
      {...props}
    />
  )
}

export function OTPFieldSeparator({
  className,
  sx,
  ...props
}: React.ComponentProps<typeof Separator> & { sx?: Sx }): React.ReactElement {
  return (
    <OTPFieldPrimitive.Separator
      render={
        <Separator
          className={className}
          orientation="horizontal"
          sx={[styles.separator, sx]}
          {...props}
        />
      }
    />
  )
}

export { OTPFieldPrimitive }
