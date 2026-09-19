"use client"

import { Input as InputPrimitive } from "@base-ui/react/input"
import * as stylex from "@stylexjs/stylex"
import type * as React from "react"
import { cn } from "@/utils/cn"
import type { Sx } from "../../styles/sx"
import { colors, consts, radius, shadows } from "../../styles/tokens.stylex"

const styles = stylex.create({
  control: {
    borderColor: {
      default: colors.input,
      ":focus-within": colors.ring,
    },
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.field,
    boxShadow: {
      default: shadows.chip,
      ":focus-within": "none",
    },
    color: colors.foreground,
    display: "inline-flex",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    outlineColor: `color-mix(in srgb, ${colors.ring} 24%, transparent)`,
    outlineOffset: 0,
    outlineStyle: {
      default: "none",
      ":focus-within": "solid",
    },
    outlineWidth: 3,
    position: "relative",
    transitionProperty: "box-shadow, border-color",
    width: "100%",
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: {
        default: shadows.edge,
        ":focus-within": "none",
      },
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
  // `:has()` is lint-banned, so the wrapper cannot read the state of the
  // control inside it. The component already knows both from its props and
  // mirrors them onto the wrapper element as attributes instead.
  controlDisabled: {
    opacity: 0.64,
  },
  controlInvalid: {
    borderColor: {
      default: `color-mix(in srgb, ${colors.destructive} 36%, transparent)`,
      ":focus-within": `color-mix(in srgb, ${colors.destructive} 64%, transparent)`,
    },
    outlineColor: `color-mix(in srgb, ${colors.destructive} 16%, transparent)`,
  },
  input: {
    borderRadius: "inherit",
    paddingInline: "calc(0.75rem - 1px)",
    backgroundColor: "transparent",
    color: "inherit",
    fontSize: "inherit",
    lineHeight: {
      default: "2.625rem",
      [consts.sm]: "2.375rem",
    },
    outlineStyle: "none",
    // Chrome paints its autofill background on a transition; the absurd
    // duration is the standard trick for suppressing it.
    transitionDuration: "5000000s",
    transitionProperty: "background-color",
    transitionTimingFunction: "ease-in-out",
    height: {
      default: "2.625rem",
      [consts.sm]: "2.375rem",
    },
    minWidth: 0,
    width: "100%",
    "::placeholder": {
      color: `color-mix(in srgb, ${colors.mutedForeground} 72%, transparent)`,
    },
  },
  inputSm: {
    paddingInline: "calc(0.625rem - 1px)",
    lineHeight: {
      default: "2.125rem",
      [consts.sm]: "1.875rem",
    },
    height: {
      default: "2.125rem",
      [consts.sm]: "1.875rem",
    },
  },
  inputLg: {
    lineHeight: {
      default: "3.125rem",
      [consts.sm]: "2.875rem",
    },
    height: {
      default: "3.125rem",
      [consts.sm]: "2.875rem",
    },
  },
  inputFile: {
    color: colors.mutedForeground,
    "::file-selector-button": {
      backgroundColor: "transparent",
      color: colors.foreground,
      fontSize: "0.875rem",
      fontWeight: 500,
      marginRight: "0.75rem",
    },
  },
})

export type InputProps = Omit<
  InputPrimitive.Props & React.RefAttributes<HTMLInputElement>,
  "size"
> & {
  size?: "sm" | "default" | "lg" | number
  unstyled?: boolean
  nativeInput?: boolean
  sx?: Sx
}

export function Input({
  className,
  size = "default",
  unstyled = false,
  nativeInput = false,
  style,
  sx,
  ...props
}: InputProps): React.ReactElement {
  const inputProps = stylex.props(
    styles.input,
    size === "sm" && styles.inputSm,
    size === "lg" && styles.inputLg,
    props.type === "file" && styles.inputFile,
  )
  const controlProps = stylex.props(
    !unstyled && styles.control,
    !unstyled && props.disabled === true && styles.controlDisabled,
    !unstyled && props["aria-invalid"] !== undefined && styles.controlInvalid,
    sx,
  )

  return (
    <span
      aria-invalid={props["aria-invalid"]}
      className={cn(controlProps.className, className) || undefined}
      data-disabled={props.disabled ? "" : undefined}
      data-size={size}
      data-slot="input-control"
      style={controlProps.style}
    >
      {nativeInput ? (
        <input
          className={inputProps.className}
          data-slot="input"
          size={typeof size === "number" ? size : undefined}
          style={{
            ...inputProps.style,
            ...(typeof style === "function" ? undefined : style),
          }}
          {...props}
        />
      ) : (
        <InputPrimitive
          className={inputProps.className}
          data-slot="input"
          size={typeof size === "number" ? size : undefined}
          style={style ?? inputProps.style}
          {...props}
        />
      )}
    </span>
  )
}

export { InputPrimitive }
