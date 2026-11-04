import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import * as stylex from "@stylexjs/stylex"
import * as React from "react"
import type { Sx } from "../../styles/sx"
import { breakpoints, colors, motion, radius, shadows } from "../../styles/tokens.stylex"
import { cn } from "../../utils/cn"

const styles = stylex.create({
  root: {
    padding: "0.25rem",
    borderRadius: radius.full,
    gap: "0.125rem",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    display: "flex",
    scrollbarWidth: "none",
    maxWidth: "100%",
    overflowX: "auto",
    overscrollBehaviorX: "contain",
    width: "fit-content",
  },
  fullWidth: {
    contain: "inline-size",
    width: "100%",
  },
  item: {
    borderColor: "transparent",
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    paddingInline: "calc(0.75rem - 1px)",
    alignItems: "center",
    backgroundColor: {
      "[data-checked]": colors.wellRaised,
      default: "transparent",
    },
    boxShadow: {
      "[data-checked]": shadows.raised,
      default: "none",
    },
    color: {
      "[data-checked]": colors.foreground,
      default: `color-mix(in srgb, ${colors.mutedForeground} 72%, transparent)`,
      ":hover": colors.mutedForeground,
    },
    cursor: "pointer",
    display: "inline-flex",
    flexGrow: 1,
    flexShrink: 0,
    fontSize: {
      default: "1rem",
      [breakpoints.sm]: "0.875rem",
    },
    fontWeight: 500,
    justifyContent: "center",
    opacity: {
      "[data-disabled]": 0.64,
      default: null,
    },
    outlineColor: colors.ring,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
    pointerEvents: {
      "[data-disabled]": "none",
      default: null,
    },
    transitionDuration: motion.enter,
    transitionProperty: "color, background-color, box-shadow",
    userSelect: "none",
    whiteSpace: "nowrap",
    height: {
      default: "2.25rem",
      [breakpoints.sm]: "2rem",
    },
  },
  itemSm: {
    paddingInline: "calc(0.625rem - 1px)",
    fontSize: {
      default: "0.875rem",
      [breakpoints.sm]: "0.8125rem",
    },
    height: {
      default: "2rem",
      [breakpoints.sm]: "1.75rem",
    },
  },
})

export function SegmentedControl({
  className,
  fullWidth = false,
  sx,
  ...props
}: RadioGroupPrimitive.Props & {
  fullWidth?: boolean
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.root, fullWidth && styles.fullWidth, sx)
  const revealChecked = React.useCallback((node: HTMLDivElement | null) => {
    const checked = node?.querySelector<HTMLElement>("[data-checked]")

    if (node === null || checked === null || checked === undefined) {
      return
    }

    const end = checked.offsetLeft + checked.offsetWidth

    if (end > node.scrollLeft + node.clientWidth) {
      node.scrollLeft = end - node.clientWidth + 4
    }
  }, [])

  return (
    <RadioGroupPrimitive
      className={cn(styleProps.className, className)}
      data-slot="segmented-control"
      ref={revealChecked}
      style={styleProps.style}
      {...props}
    />
  )
}

export function SegmentedControlItem({
  className,
  size = "default",
  sx,
  ...props
}: RadioPrimitive.Root.Props & {
  size?: "sm" | "default"
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.item, size === "sm" && styles.itemSm, sx)

  return (
    <RadioPrimitive.Root
      className={cn(styleProps.className, className)}
      data-slot="segmented-control-item"
      style={styleProps.style}
      {...props}
    />
  )
}
