"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/utils/cn"
import { colors, radius, shadows } from "../../styles/tokens.stylex"
import { surface } from "../../styles/recipes"
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
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.popover,
    boxShadow: shadows.overlay,
    color: colors.popoverForeground,
    display: "flex",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    opacity: {
      "[data-ending-style]": 0,
      "[data-starting-style]": 0,
      default: null,
    },
    position: "relative",
    scale: {
      "[data-ending-style]": "0.98",
      "[data-starting-style]": "0.98",
      default: null,
    },
    textWrap: "balance",
    transformOrigin: "var(--transform-origin)",
    transitionDuration: {
      "[data-instant]": "0s",
      default: "150ms",
    },
    transitionProperty: "width, height, scale, opacity",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    height: "var(--popup-height, auto)",
    width: "var(--popup-width, auto)",
  },
  viewport: {
    overflow: "clip",
    paddingBlock: "0.25rem",
    paddingInline: "var(--viewport-inline-padding)",
    position: "relative",
    transitionProperty: {
      "[data-instant]": "none",
      default: null,
    },
    height: "100%",
    width: "100%",
  },
})

export const TooltipCreateHandle: typeof TooltipPrimitive.createHandle =
  TooltipPrimitive.createHandle

export const TooltipProvider: typeof TooltipPrimitive.Provider = TooltipPrimitive.Provider

export const Tooltip: typeof TooltipPrimitive.Root = TooltipPrimitive.Root

export function TooltipTrigger(props: TooltipPrimitive.Trigger.Props): React.ReactElement {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

export function TooltipPopup({
  className,
  align = "center",
  sideOffset = 4,
  side = "top",
  anchor,
  children,
  portalProps,
  sx,
  ...props
}: TooltipPrimitive.Popup.Props & {
  align?: TooltipPrimitive.Positioner.Props["align"]
  side?: TooltipPrimitive.Positioner.Props["side"]
  sideOffset?: TooltipPrimitive.Positioner.Props["sideOffset"]
  anchor?: TooltipPrimitive.Positioner.Props["anchor"]
  portalProps?: TooltipPrimitive.Portal.Props
  sx?: Sx
}): React.ReactElement {
  const positionerProps = stylex.props(styles.positioner)
  const popupProps = stylex.props(surface.raisedEdge, styles.popup, sx)
  const viewportProps = stylex.props(styles.viewport)
  // `--viewport-inline-padding` is read back by the viewport's own padding and
  // by the [data-current]/[data-previous] width rules in structural.css.
  const viewportStyle = {
    ...viewportProps.style,
    "--viewport-inline-padding": "0.5rem",
  } as React.CSSProperties

  return (
    <TooltipPrimitive.Portal {...portalProps}>
      <TooltipPrimitive.Positioner
        align={align}
        anchor={anchor}
        className={positionerProps.className}
        data-slot="tooltip-positioner"
        side={side}
        sideOffset={sideOffset}
        style={positionerProps.style}
      >
        <TooltipPrimitive.Popup
          className={cn(popupProps.className, className)}
          data-slot="tooltip-popup"
          style={popupProps.style}
          {...props}
        >
          <TooltipPrimitive.Viewport
            className={viewportProps.className}
            data-slot="tooltip-viewport"
            style={viewportStyle}
          >
            {children}
          </TooltipPrimitive.Viewport>
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { TooltipPrimitive, TooltipPopup as TooltipContent }
