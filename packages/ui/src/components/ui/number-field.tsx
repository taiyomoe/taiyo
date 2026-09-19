"use client"

import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field"
import * as stylex from "@stylexjs/stylex"
import * as React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/utils/cn"
import { Minus, Plus } from "@/components/icons"
import type { Sx } from "../../styles/sx"
import { colors, consts, radius, shadows } from "../../styles/tokens.stylex"
import { focus, tap } from "../../styles/recipes"

export type NumberFieldSize = "sm" | "default" | "lg"

export const NumberFieldContext: React.Context<{
  fieldId: string
} | null> = React.createContext<{
  fieldId: string
} | null>(null)

/** Size travels down to the input and the steppers, which are nested too
 * deep for any selector StyleX offers to reach. */
const NumberFieldSizeContext = React.createContext<NumberFieldSize>("default")
const styles = stylex.create({
  root: {
    gap: "0.5rem",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  group: {
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
    display: "flex",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    justifyContent: "space-between",
    opacity: {
      "[data-disabled]": 0.64,
      default: null,
    },
    pointerEvents: {
      "[data-disabled]": "none",
      default: null,
    },
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
  groupInvalid: {
    borderColor: {
      default: `color-mix(in srgb, ${colors.destructive} 36%, transparent)`,
      ":focus-within": `color-mix(in srgb, ${colors.destructive} 64%, transparent)`,
    },
    outlineColor: `color-mix(in srgb, ${colors.destructive} 16%, transparent)`,
  },
  stepper: {
    paddingInline: "calc(0.75rem - 1px)",
    alignItems: "center",
    backgroundColor: {
      default: null,
      ":hover": colors.accent,
    },
    cursor: "pointer",
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
    position: "relative",
    transitionProperty: "background-color",
  },
  stepperSm: {
    paddingInline: "calc(0.625rem - 1px)",
  },
  decrement: {
    borderEndStartRadius: "calc(1.225rem - 1px)",
    borderStartStartRadius: "calc(1.225rem - 1px)",
  },
  increment: {
    borderEndEndRadius: "calc(1.225rem - 1px)",
    borderStartEndRadius: "calc(1.225rem - 1px)",
  },
  input: {
    paddingInline: "calc(0.75rem - 1px)",
    backgroundColor: "transparent",
    flexGrow: 1,
    fontVariantNumeric: "tabular-nums",
    lineHeight: {
      default: "2.625rem",
      [consts.sm]: "2.375rem",
    },
    outlineStyle: "none",
    textAlign: "center",
    // Suppresses Chrome's autofill background animation (see input.tsx).
    transitionDuration: "5000000s",
    transitionProperty: "background-color",
    transitionTimingFunction: "ease-in-out",
    height: {
      default: "2.625rem",
      [consts.sm]: "2.375rem",
    },
    minWidth: 0,
    width: "100%",
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
  scrubArea: {
    cursor: "ew-resize",
    display: "flex",
  },
  scrubLabel: {
    cursor: "ew-resize",
  },
  scrubCursor: {
    filter: "drop-shadow(0 1px 1px #0008)",
  },
})

export function NumberField({
  id,
  className,
  size = "default",
  sx,
  ...props
}: NumberFieldPrimitive.Root.Props & {
  size?: NumberFieldSize
  sx?: Sx
}): React.ReactElement {
  const generatedId = React.useId()
  const fieldId = id ?? generatedId
  const contextValue = React.useMemo(() => ({ fieldId }), [fieldId])
  const styleProps = stylex.props(styles.root, sx)

  return (
    <NumberFieldContext.Provider value={contextValue}>
      <NumberFieldSizeContext value={size}>
        <NumberFieldPrimitive.Root
          className={cn(styleProps.className, className)}
          data-size={size}
          data-slot="number-field"
          id={fieldId}
          style={styleProps.style}
          {...props}
        />
      </NumberFieldSizeContext>
    </NumberFieldContext.Provider>
  )
}

export function NumberFieldGroup({
  className,
  sx,
  ...props
}: NumberFieldPrimitive.Group.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(
    focus.field,
    styles.group,
    props["aria-invalid"] !== undefined && styles.groupInvalid,
    sx,
  )

  return (
    <NumberFieldPrimitive.Group
      className={cn(styleProps.className, className)}
      data-slot="number-field-group"
      style={styleProps.style}
      {...props}
    />
  )
}

export function NumberFieldDecrement({
  className,
  sx,
  ...props
}: NumberFieldPrimitive.Decrement.Props & { sx?: Sx }): React.ReactElement {
  const size = React.useContext(NumberFieldSizeContext)
  const styleProps = stylex.props(
    tap.target,
    styles.stepper,
    styles.decrement,
    size === "sm" && styles.stepperSm,
    sx,
  )

  return (
    <NumberFieldPrimitive.Decrement
      className={cn(styleProps.className, className)}
      data-slot="number-field-decrement"
      style={styleProps.style}
      {...props}
    >
      <Minus />
    </NumberFieldPrimitive.Decrement>
  )
}

export function NumberFieldIncrement({
  className,
  sx,
  ...props
}: NumberFieldPrimitive.Increment.Props & { sx?: Sx }): React.ReactElement {
  const size = React.useContext(NumberFieldSizeContext)
  const styleProps = stylex.props(
    tap.target,
    styles.stepper,
    styles.increment,
    size === "sm" && styles.stepperSm,
    sx,
  )

  return (
    <NumberFieldPrimitive.Increment
      className={cn(styleProps.className, className)}
      data-slot="number-field-increment"
      style={styleProps.style}
      {...props}
    >
      <Plus />
    </NumberFieldPrimitive.Increment>
  )
}

export function NumberFieldInput({
  className,
  sx,
  ...props
}: NumberFieldPrimitive.Input.Props & { sx?: Sx }): React.ReactElement {
  const size = React.useContext(NumberFieldSizeContext)
  const styleProps = stylex.props(
    styles.input,
    size === "sm" && styles.inputSm,
    size === "lg" && styles.inputLg,
    sx,
  )

  return (
    <NumberFieldPrimitive.Input
      className={cn(styleProps.className, className)}
      data-slot="number-field-input"
      style={styleProps.style}
      {...props}
    />
  )
}

export function NumberFieldScrubArea({
  className,
  label,
  sx,
  ...props
}: NumberFieldPrimitive.ScrubArea.Props & {
  label: string
  sx?: Sx
}): React.ReactElement {
  const context = React.useContext(NumberFieldContext)
  const styleProps = stylex.props(styles.scrubArea, sx)
  const cursorProps = stylex.props(styles.scrubCursor)

  if (!context) {
    throw new Error(
      "NumberFieldScrubArea must be used within a NumberField component for accessibility.",
    )
  }

  return (
    <NumberFieldPrimitive.ScrubArea
      className={cn(styleProps.className, className)}
      data-slot="number-field-scrub-area"
      style={styleProps.style}
      {...props}
    >
      <Label htmlFor={context.fieldId} sx={styles.scrubLabel}>
        {label}
      </Label>
      <NumberFieldPrimitive.ScrubAreaCursor
        className={cursorProps.className}
        style={cursorProps.style}
      >
        <CursorGrowIcon />
      </NumberFieldPrimitive.ScrubAreaCursor>
    </NumberFieldPrimitive.ScrubArea>
  )
}

export function CursorGrowIcon(props: React.ComponentProps<"svg">): React.ReactElement {
  return (
    <svg
      aria-hidden="true"
      fill="black"
      height="14"
      stroke="white"
      viewBox="0 0 24 14"
      width="26"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z" />
    </svg>
  )
}

export { NumberFieldPrimitive }
