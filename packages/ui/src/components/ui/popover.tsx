"use client"

import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/lib/utils"
import { colors, radius, shadows, text } from "../../styles/tokens.stylex"
import type { Sx } from "../../styles/sx"

const styles = stylex.create({
  positioner: {
    transitionDuration: "150ms",
    transitionProperty: {
      "[data-instant]": "none",
      default: "top, left, right, bottom, transform",
    },
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 50,
    height: "var(--positioner-height)",
    maxWidth: "var(--available-width)",
    width: "var(--positioner-width)",
  },
  popup: {
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.popover,
    boxShadow: shadows.overlay,
    color: colors.popoverForeground,
    display: "flex",
    opacity: {
      "[data-starting-style]": 0,
      default: null,
    },
    outlineStyle: "none",
    position: "relative",
    scale: {
      "[data-starting-style]": "0.98",
      default: null,
    },
    transformOrigin: "var(--transform-origin)",
    transitionDuration: "150ms",
    transitionProperty: "width, height, scale, opacity",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    height: "var(--popup-height, auto)",
    width: "var(--popup-width, auto)",
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: shadows.edge,
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
  popupTooltipStyle: {
    borderRadius: radius.md,
    fontSize: "0.75rem",
    lineHeight: "1rem",
    textWrap: "balance",
    width: "fit-content",
  },
  viewport: {
    paddingBlock: "1rem",
    paddingInline: "var(--viewport-inline-padding)",
    position: "relative",
    transitionProperty: {
      "[data-instant]": "none",
      default: null,
    },
    height: "100%",
    maxHeight: "var(--available-height)",
    overflowX: "clip",
    overflowY: {
      "[data-transitioning]": "clip",
      default: "auto",
    },
    width: "100%",
  },
  viewportTooltipStyle: {
    paddingBlock: "0.25rem",
    overflowY: "clip",
  },
  title: {
    fontSize: text.lg,
    fontWeight: 600,
    lineHeight: 1,
  },
  description: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
})

export const PopoverCreateHandle: typeof PopoverPrimitive.createHandle =
  PopoverPrimitive.createHandle

export const Popover: typeof PopoverPrimitive.Root = PopoverPrimitive.Root

export function PopoverTrigger({
  className,
  children,
  sx,
  ...props
}: PopoverPrimitive.Trigger.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(sx)

  return (
    <PopoverPrimitive.Trigger
      className={cn(styleProps.className, className)}
      data-slot="popover-trigger"
      style={styleProps.style}
      {...props}
    >
      {children}
    </PopoverPrimitive.Trigger>
  )
}

export function PopoverPopup({
  children,
  className,
  side = "bottom",
  align = "center",
  sideOffset = 4,
  alignOffset = 0,
  tooltipStyle = false,
  anchor,
  portalProps,
  sx,
  ...props
}: PopoverPrimitive.Popup.Props & {
  portalProps?: PopoverPrimitive.Portal.Props
  side?: PopoverPrimitive.Positioner.Props["side"]
  align?: PopoverPrimitive.Positioner.Props["align"]
  sideOffset?: PopoverPrimitive.Positioner.Props["sideOffset"]
  alignOffset?: PopoverPrimitive.Positioner.Props["alignOffset"]
  tooltipStyle?: boolean
  anchor?: PopoverPrimitive.Positioner.Props["anchor"]
  sx?: Sx
}): React.ReactElement {
  const positionerProps = stylex.props(styles.positioner)
  const popupProps = stylex.props(styles.popup, tooltipStyle && styles.popupTooltipStyle, sx)
  const viewportProps = stylex.props(styles.viewport, tooltipStyle && styles.viewportTooltipStyle)
  // `--viewport-inline-padding` is read back by the viewport's own padding and
  // by the [data-current]/[data-previous] width rules in structural.css.
  const viewportStyle = {
    ...viewportProps.style,
    "--viewport-inline-padding": tooltipStyle ? "0.5rem" : "1rem",
  } as React.CSSProperties

  return (
    <PopoverPrimitive.Portal {...portalProps}>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className={positionerProps.className}
        data-slot="popover-positioner"
        side={side}
        sideOffset={sideOffset}
        style={positionerProps.style}
      >
        <PopoverPrimitive.Popup
          className={cn(popupProps.className, className)}
          data-slot="popover-popup"
          style={popupProps.style}
          {...props}
        >
          <PopoverPrimitive.Viewport
            className={viewportProps.className}
            data-slot="popover-viewport"
            style={viewportStyle}
          >
            {children}
          </PopoverPrimitive.Viewport>
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

export function PopoverClose({ ...props }: PopoverPrimitive.Close.Props): React.ReactElement {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />
}

export function PopoverTitle({
  className,
  sx,
  ...props
}: PopoverPrimitive.Title.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.title, sx)

  return (
    <PopoverPrimitive.Title
      className={cn(styleProps.className, className)}
      data-slot="popover-title"
      style={styleProps.style}
      {...props}
    />
  )
}

export function PopoverDescription({
  className,
  sx,
  ...props
}: PopoverPrimitive.Description.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.description, sx)

  return (
    <PopoverPrimitive.Description
      className={cn(styleProps.className, className)}
      data-slot="popover-description"
      style={styleProps.style}
      {...props}
    />
  )
}

export { PopoverPrimitive, PopoverPopup as PopoverContent }
