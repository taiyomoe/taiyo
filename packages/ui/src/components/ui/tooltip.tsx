import type React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import * as stylex from "@stylexjs/stylex"
import type { CSSVariables, Sx } from "../../styles/sx"
import { surface, transitions } from "../../styles/recipes"
import { colors, motion, radius, shadows } from "../../styles/tokens.stylex"
import { cn } from "../../utils/cn"
import { PopupArrowSvg, popupArrowStyles, withArrowOffset } from "./popup-arrow"

const styles = stylex.create({
  positioner: {
    transitionDuration: motion.enter,
    transitionProperty: {
      "[data-instant]": "none",
      default: "top, left, right, bottom, transform",
    },
    transitionTimingFunction: motion.easeOut,
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
    backgroundClip: "border-box",
    backgroundColor: colors.popover,
    boxShadow: shadows.overlay,
    color: colors.popoverForeground,
    display: "flex",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    position: "relative",
    textWrap: "balance",
    transitionDuration: {
      "[data-ending-style]": motion.exit,
      "[data-instant]": "0s",
      default: motion.enter,
    },
    transitionProperty: "width, height, scale, opacity",
    height: "var(--popup-height, auto)",
    width: "var(--popup-width, auto)",
  },
  popupWithArrow: {
    justifyContent: "center",
    textAlign: "center",
    minWidth: "2.75rem",
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
  arrow = false,
  sx,
  ...props
}: TooltipPrimitive.Popup.Props & {
  align?: TooltipPrimitive.Positioner.Props["align"]
  side?: TooltipPrimitive.Positioner.Props["side"]
  sideOffset?: TooltipPrimitive.Positioner.Props["sideOffset"]
  anchor?: TooltipPrimitive.Positioner.Props["anchor"]
  portalProps?: TooltipPrimitive.Portal.Props
  arrow?: boolean
  sx?: Sx
}): React.ReactElement {
  const positionerProps = stylex.props(styles.positioner)
  const popupProps = stylex.props(
    transitions.popup,
    surface.raisedEdge,
    styles.popup,
    arrow && styles.popupWithArrow,
    sx,
  )
  const viewportProps = stylex.props(styles.viewport)
  const viewportStyle: CSSVariables = {
    ...viewportProps.style,
    "--viewport-inline-padding": "0.5rem",
  }

  return (
    <TooltipPrimitive.Portal {...portalProps}>
      <TooltipPrimitive.Positioner
        align={align}
        anchor={anchor}
        arrowPadding={arrow ? 12 : undefined}
        className={positionerProps.className}
        data-slot="tooltip-positioner"
        side={side}
        sideOffset={withArrowOffset(sideOffset, arrow)}
        style={positionerProps.style}
      >
        <TooltipPrimitive.Popup
          className={cn(popupProps.className, className)}
          data-slot="tooltip-popup"
          style={popupProps.style}
          {...props}
        >
          {arrow ? (
            <TooltipPrimitive.Arrow {...stylex.props(popupArrowStyles.arrow)}>
              <PopupArrowSvg />
            </TooltipPrimitive.Arrow>
          ) : null}
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
