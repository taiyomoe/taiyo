import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import * as stylex from "@stylexjs/stylex"
import * as React from "react"
import type { Sx } from "../../styles/sx"
import { breakpoints, colors, consts, motion, radius, shadows } from "../../styles/tokens.stylex"
import { cn } from "../../utils/cn"

type CheckedRect = Record<"left" | "top" | "width" | "height", number>

const styles = stylex.create({
  root: {
    padding: "0.25rem",
    borderRadius: radius.full,
    gap: "0.125rem",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    display: "flex",
    position: "relative",
    scrollbarWidth: "none",
    zIndex: 0,
    maxWidth: "100%",
    overflowX: "auto",
    overscrollBehaviorX: "contain",
    width: "fit-content",
  },
  fullWidth: {
    contain: "inline-size",
    width: "100%",
  },
  indicator: {
    borderRadius: radius.full,
    backgroundColor: colors.wellRaised,
    boxShadow: shadows.raised,
    pointerEvents: "none",
    position: "absolute",
    transitionDuration: {
      default: motion.springDuration,
      [consts.reducedMotion]: "0s",
    },
    transitionProperty: "width, height, translate",
    transitionTimingFunction: motion.spring,
    zIndex: -1,
    left: 0,
    top: 0,
  },
  indicatorPosition: (rect: CheckedRect) => ({
    translate: `${rect.left}px ${rect.top}px`,
    height: rect.height,
    width: rect.width,
  }),
  item: {
    borderColor: "transparent",
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    paddingInline: "calc(0.75rem - 1px)",
    alignItems: "center",
    backgroundColor: "transparent",
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
    transitionProperty: "color",
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

function trackCheckedItem(node: HTMLDivElement, onChange: (rect: CheckedRect | null) => void) {
  const findChecked = () =>
    node.querySelector<HTMLElement>('[data-slot="segmented-control-item"][data-checked]')
  const checked = findChecked()

  if (checked !== null) {
    const end = checked.offsetLeft + checked.offsetWidth

    if (end > node.scrollLeft + node.clientWidth) {
      node.scrollLeft = end - node.clientWidth + 4
    }
  }

  const measure = () => {
    const item = findChecked()

    onChange(
      item === null
        ? null
        : {
            left: item.offsetLeft,
            top: item.offsetTop,
            width: item.offsetWidth,
            height: item.offsetHeight,
          },
    )
  }

  measure()

  const mutations = new MutationObserver(measure)
  const resizes = new ResizeObserver(measure)

  mutations.observe(node, { attributeFilter: ["data-checked"], subtree: true })
  resizes.observe(node)

  for (const item of node.children) {
    resizes.observe(item)
  }

  return () => {
    mutations.disconnect()
    resizes.disconnect()
  }
}

export function SegmentedControl({
  className,
  children,
  fullWidth = false,
  sx,
  ...props
}: RadioGroupPrimitive.Props & {
  fullWidth?: boolean
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.root, fullWidth && styles.fullWidth, sx)
  const [checkedRect, setCheckedRect] = React.useState<CheckedRect | null>(null)
  const track = React.useCallback(
    (node: HTMLDivElement | null) =>
      node === null ? undefined : trackCheckedItem(node, setCheckedRect),
    [],
  )

  return (
    <RadioGroupPrimitive
      className={cn(styleProps.className, className)}
      data-slot="segmented-control"
      ref={track}
      style={styleProps.style}
      {...props}
    >
      {children}
      {checkedRect !== null && (
        <span
          aria-hidden
          data-slot="segmented-control-indicator"
          {...stylex.props(styles.indicator, styles.indicatorPosition(checkedRect))}
        />
      )}
    </RadioGroupPrimitive>
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
