import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/utils/cn"
import { colors, consts, radius, shadows } from "../../styles/tokens.stylex"
import { focus } from "../../styles/recipes"
import type { Sx } from "../../styles/sx"
// Marker for the root so the thumb can squish when the track is pressed.
// The same squish on an enclosing label is not expressible — a marker cannot
// cross component files — so pressing the label alone does not animate.
import { switchRootMarker } from "../../styles/markers.stylex"
// The thumb is 1.25rem (1rem from `sm` up). Every dimension that depends on
// it is expanded inline with its own `consts.sm` condition rather than being
// derived from the custom property, which only the thumb itself reads back.
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
    transitionDuration: "200ms",
    transitionProperty: "background-color, box-shadow",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    height: "calc(var(--thumb-size) + 2px)",
    width: "calc(var(--thumb-size) * 2 - 2px)",
  },
  thumb: {
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
    // A disabled root never matches `:active` — Base UI renders it as a
    // disabled button — so no extra guard is needed here.
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

export type SwitchProps = SwitchPrimitive.Root.Props & {
  sx?: Sx
}

export function Switch({ className, sx, ...props }: SwitchProps): React.ReactElement {
  const styleProps = stylex.props(focus.control, styles.root, switchRootMarker, sx)
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
