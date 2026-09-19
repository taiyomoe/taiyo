"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/utils/cn"
import { colors, consts, radius, shadows } from "../../styles/tokens.stylex"
import type { Sx } from "../../styles/sx"

const styles = stylex.create({
  group: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  radio: {
    borderColor: {
      "[aria-invalid]": {
        default: `color-mix(in srgb, ${colors.destructive} 36%, transparent)`,
        ":focus-visible": `color-mix(in srgb, ${colors.destructive} 64%, transparent)`,
      },
      default: colors.input,
    },
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "center",
    backgroundClip: "padding-box",
    // The input-surface token: a radio is a field, and once checked the
    // indicator covers the root entirely, so only the unchecked fill shows.
    backgroundColor: colors.field,
    boxShadow: {
      "[aria-invalid]": "none",
      "[data-checked]": "none",
      "[data-disabled]": "none",
      default: "0 1px 2px 0 rgb(0 0 0 / 5%)",
    },
    cursor: {
      "[data-disabled]": "not-allowed",
      default: null,
    },
    display: "inline-flex",
    flexShrink: 0,
    justifyContent: "center",
    opacity: {
      "[data-disabled]": 0.64,
      default: 1,
    },
    outlineColor: {
      "[aria-invalid]": `color-mix(in srgb, ${colors.destructive} 48%, transparent)`,
      default: colors.ring,
    },
    outlineOffset: 1,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
    position: "relative",
    transitionDuration: "150ms",
    transitionProperty: "box-shadow",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    height: {
      default: "1.125rem",
      [consts.sm]: "1rem",
    },
    width: {
      default: "1.125rem",
      [consts.sm]: "1rem",
    },
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: {
        "[aria-invalid]": "none",
        "[data-checked]": "none",
        "[data-disabled]": "none",
        default: shadows.edge,
      },
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
  indicator: {
    inset: -1,
    borderRadius: radius.full,
    alignItems: "center",
    backgroundColor: {
      "[data-checked]": colors.primary,
      default: null,
    },
    display: {
      "[data-unchecked]": "none",
      default: "flex",
    },
    justifyContent: "center",
    position: "absolute",
    height: {
      default: "1.125rem",
      [consts.sm]: "1rem",
    },
    width: {
      default: "1.125rem",
      [consts.sm]: "1rem",
    },
    "::before": {
      borderRadius: radius.full,
      backgroundColor: colors.primaryForeground,
      content: '""',
      height: {
        default: "0.5rem",
        [consts.sm]: "0.375rem",
      },
      width: {
        default: "0.5rem",
        [consts.sm]: "0.375rem",
      },
    },
  },
})

export type RadioGroupProps = RadioGroupPrimitive.Props & {
  sx?: Sx
}

export function RadioGroup({ className, sx, ...props }: RadioGroupProps): React.ReactElement {
  const styleProps = stylex.props(styles.group, sx)

  return (
    <RadioGroupPrimitive
      className={cn(styleProps.className, className)}
      data-slot="radio-group"
      style={styleProps.style}
      {...props}
    />
  )
}

export type RadioProps = RadioPrimitive.Root.Props & {
  sx?: Sx
}

export function Radio({ className, sx, ...props }: RadioProps): React.ReactElement {
  const styleProps = stylex.props(styles.radio, sx)
  const indicatorProps = stylex.props(styles.indicator)

  return (
    <RadioPrimitive.Root
      className={cn(styleProps.className, className)}
      data-slot="radio"
      style={styleProps.style}
      {...props}
    >
      <RadioPrimitive.Indicator
        className={indicatorProps.className}
        data-slot="radio-indicator"
        style={indicatorProps.style}
      />
    </RadioPrimitive.Root>
  )
}

export { RadioGroupPrimitive, RadioPrimitive, Radio as RadioGroupItem }
