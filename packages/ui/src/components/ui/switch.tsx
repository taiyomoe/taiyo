"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/lib/utils"
import { colors, consts, radius, shadows } from "../../styles/tokens.stylex"
import type { Sx } from "../../styles/sx"
// Marker for the root so the thumb can react to the track being pressed (the
// Tailwind original's `in-[[role=switch]:active]` squish). The label-active
// variants (`[data-slot=label]:active`, `[data-slot=field-label]:active`)
// cannot cross component files and were dropped — a minor animation nicety.
import { switchRootMarker } from "../../styles/markers.stylex"
// The thumb is 1.25rem (1rem from `sm:` up). The Tailwind original derived
// every dimension from a `--thumb-size` custom property; the sizes are
// expanded inline here instead, with `consts.sm` conditions on each.
const styles = stylex.create({
  root: {
    // The thumb reads `--thumb-size` back: a `stylex.when` key is only legal
    // at the first level of a condition, so the breakpoint cannot nest under
    // the thumb's ancestor states and lives here instead.
    "--thumb-size": {
      default: "1.25rem",
      [consts.sm]: "1rem",
    },
    padding: "1px",
    borderRadius: radius.full,
    alignItems: "center",
    // Sunken track when unchecked, brand fill when checked.
    backgroundColor: {
      "[data-checked]": colors.primary,
      default: colors.well,
    },
    boxShadow: {
      "[data-checked]": "none",
      default: shadows.sunken,
    },
    cursor: {
      "[data-disabled]": "not-allowed",
      default: null,
    },
    display: "inline-flex",
    flexShrink: 0,
    opacity: {
      "[data-disabled]": 0.64,
      default: 1,
    },
    outlineColor: colors.ring,
    outlineOffset: 1,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
    transitionDuration: "200ms",
    transitionProperty: "background-color, box-shadow",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    height: "calc(var(--thumb-size) + 2px)",
    width: "calc(var(--thumb-size) * 2 - 2px)",
  },
  thumb: {
    // Capsule at rest; squishes into an ellipse while the track is pressed.
    borderRadius: {
      default: "var(--thumb-size)",
      [stylex.when.ancestor(":active", switchRootMarker)]:
        "var(--thumb-size) / calc(var(--thumb-size) * 1.1)",
    },
    aspectRatio: "1",
    backgroundColor: "#fff",
    boxShadow: shadows.thumb,
    display: "block",
    pointerEvents: "none",
    // A disabled root never matches `:active` (Base UI renders a disabled
    // button), so the original's `not-data-disabled` guard is redundant.
    scale: {
      default: null,
      [stylex.when.ancestor(":active", switchRootMarker)]: "1.1 1",
    },
    transformOrigin: {
      "[data-checked]": "var(--thumb-size) 50%",
      default: "left",
    },
    transitionDelay: "0s, 0s, 0.1s, 0s",
    transitionDuration: "0.15s, 0.15s, 0.1s, 0.15s",
    transitionProperty: "translate, border-radius, scale, transform-origin",
    translate: {
      "[data-checked]": "calc(var(--thumb-size) - 4px)",
      default: null,
    },
    willChange: "transform",
    height: "100%",
  },
})

/** See the note on SeparatorProps: `className` stays until callers migrate. */
export type SwitchProps = SwitchPrimitive.Root.Props & {
  sx?: Sx
}

export function Switch({ className, sx, ...props }: SwitchProps): React.ReactElement {
  const styleProps = stylex.props(styles.root, switchRootMarker, sx)
  const thumbProps = stylex.props(styles.thumb)

  return (
    <SwitchPrimitive.Root
      className={cn(styleProps.className, className)}
      data-slot="switch"
      style={styleProps.style}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={thumbProps.className}
        data-slot="switch-thumb"
        style={thumbProps.style}
      />
    </SwitchPrimitive.Root>
  )
}

export { SwitchPrimitive }
