"use client"

import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/lib/utils"
import { colors, radius, shadows } from "../../styles/tokens.stylex"
import type { Sx } from "../../styles/sx"

const styles = stylex.create({
  positioner: {
    zIndex: 50,
  },
  popup: {
    padding: "1rem",
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.popover,
    boxShadow: shadows.overlay,
    color: colors.popoverForeground,
    display: "flex",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
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
    transitionDuration: "150ms",
    transitionProperty: "scale, opacity",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    width: "16rem",
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: shadows.edge,
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
})

export const PreviewCard: typeof PreviewCardPrimitive.Root = PreviewCardPrimitive.Root

export function PreviewCardTrigger({
  ...props
}: PreviewCardPrimitive.Trigger.Props): React.ReactElement {
  return <PreviewCardPrimitive.Trigger data-slot="preview-card-trigger" {...props} />
}

export function PreviewCardPopup({
  className,
  children,
  align = "center",
  sideOffset = 4,
  anchor,
  portalProps,
  sx,
  ...props
}: PreviewCardPrimitive.Popup.Props & {
  align?: PreviewCardPrimitive.Positioner.Props["align"]
  sideOffset?: PreviewCardPrimitive.Positioner.Props["sideOffset"]
  anchor?: PreviewCardPrimitive.Positioner.Props["anchor"]
  portalProps?: PreviewCardPrimitive.Portal.Props
  sx?: Sx
}): React.ReactElement {
  const positionerProps = stylex.props(styles.positioner)
  const popupProps = stylex.props(styles.popup, sx)

  return (
    <PreviewCardPrimitive.Portal {...portalProps}>
      <PreviewCardPrimitive.Positioner
        align={align}
        anchor={anchor}
        className={positionerProps.className}
        data-slot="preview-card-positioner"
        sideOffset={sideOffset}
        style={positionerProps.style}
      >
        <PreviewCardPrimitive.Popup
          className={cn(popupProps.className, className)}
          data-slot="preview-card-content"
          style={popupProps.style}
          {...props}
        >
          {children}
        </PreviewCardPrimitive.Popup>
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
}

export {
  PreviewCardPrimitive,
  PreviewCard as HoverCard,
  PreviewCardTrigger as HoverCardTrigger,
  PreviewCardPopup as HoverCardContent,
}
