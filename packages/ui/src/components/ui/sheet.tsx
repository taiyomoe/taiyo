import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/utils/cn"
import { Close } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { colors, consts, font, radius, shadows, text } from "../../styles/tokens.stylex"
import type { Sx } from "../../styles/sx"

type SheetSide = "right" | "left" | "top" | "bottom"
type SheetVariant = "default" | "inset"

const styles = stylex.create({
  backdrop: {
    inset: 0,
    backdropFilter: "blur(8px)",
    backgroundColor: "rgb(0 0 0 / 32%)",
    opacity: {
      "[data-ending-style]": 0,
      "[data-starting-style]": 0,
      default: 1,
    },
    position: "fixed",
    transitionDuration: "200ms",
    transitionProperty: "all",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 50,
  },
  viewport: {
    inset: 0,
    display: "grid",
    position: "fixed",
    zIndex: 50,
  },
  popup: {
    backgroundClip: "padding-box",
    backgroundColor: colors.popover,
    boxShadow: shadows.overlay,
    color: colors.popoverForeground,
    display: "flex",
    flexDirection: "column",
    opacity: {
      "[data-ending-style]": 0,
      "[data-starting-style]": 0,
      default: 1,
    },
    position: "relative",
    transitionDuration: "200ms",
    transitionProperty: "opacity, translate",
    transitionTimingFunction: "ease-in-out",
    willChange: "transform",
    maxHeight: "100%",
    minHeight: 0,
    minWidth: 0,
    width: "100%",
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: shadows.edge,
      content: '""',
      display: {
        default: null,
        "@media (width < 40rem)": "none",
      },
      pointerEvents: "none",
      position: "absolute",
    },
  },
  closeButton: {
    position: "absolute",
    right: "0.5rem",
    top: "0.5rem",
  },
  header: {
    padding: "1.5rem",
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    // pb shrinks further to 0.75rem when the popup contains a panel — see
    // structural.css (cross-element :has() rule).
    paddingBottom: {
      default: "1rem",
      [consts.sm]: "1.5rem",
    },
  },
  footer: {
    gap: "0.5rem",
    paddingInline: "1.5rem",
    display: "flex",
    flexDirection: {
      default: "column-reverse",
      [consts.sm]: "row",
    },
    justifyContent: {
      default: null,
      [consts.sm]: "flex-end",
    },
  },
  footerDefault: {
    paddingBlock: "1rem",
    backgroundColor: `color-mix(in srgb, ${colors.muted} 72%, transparent)`,
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  footerBare: {
    paddingBottom: "1.5rem",
    // pt shrinks to 0.75rem when the popup contains a panel — structural.css.
    paddingTop: "1rem",
  },
  title: {
    fontFamily: font.heading,
    fontSize: text.xl,
    fontWeight: 600,
    lineHeight: 1,
  },
  description: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  panel: {
    // pt/pb shrink to 0.25rem next to a header / bare footer — structural.css.
    padding: "1.5rem",
  },
})
const viewportSideStyles = stylex.create({
  bottom: {
    display: "grid",
    gridTemplateRows: "1fr auto",
    paddingTop: "3rem",
  },
  top: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    paddingBottom: "3rem",
  },
  left: {
    display: "flex",
    justifyContent: "flex-start",
  },
  right: {
    display: "flex",
    justifyContent: "flex-end",
  },
})
const viewportVariantStyles = stylex.create({
  inset: {
    padding: {
      default: null,
      [consts.sm]: "1rem",
    },
  },
})
const popupSideStyles = stylex.create({
  bottom: {
    gridRowStart: "2",
    translate: {
      "[data-ending-style]": "0 2rem",
      "[data-starting-style]": "0 2rem",
      default: null,
    },
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  top: {
    translate: {
      "[data-ending-style]": "0 -2rem",
      "[data-starting-style]": "0 -2rem",
      default: null,
    },
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
  left: {
    translate: {
      "[data-ending-style]": "-2rem 0",
      "[data-starting-style]": "-2rem 0",
      default: null,
    },
    borderRightColor: colors.border,
    borderRightStyle: "solid",
    borderRightWidth: 1,
    maxWidth: "28rem",
    width: "calc(100% - 3rem)",
  },
  right: {
    gridColumnStart: "2",
    translate: {
      "[data-ending-style]": "2rem 0",
      "[data-starting-style]": "2rem 0",
      default: null,
    },
    borderLeftColor: colors.border,
    borderLeftStyle: "solid",
    borderLeftWidth: 1,
    maxWidth: "28rem",
    width: "calc(100% - 3rem)",
  },
})
const popupVariantStyles = stylex.create({
  inset: {
    borderColor: {
      default: null,
      [consts.sm]: colors.border,
    },
    borderRadius: {
      default: null,
      [consts.sm]: radius.xxl,
    },
    borderStyle: {
      default: null,
      [consts.sm]: "solid",
    },
    borderWidth: {
      default: null,
      [consts.sm]: 1,
    },
    // Inset sheets float clear of the viewport edge and already read as
    // raised, so they drop the ::before hairline entirely.
    "::before": {
      display: "none",
    },
  },
})

export const Sheet: typeof SheetPrimitive.Root = SheetPrimitive.Root

export const SheetPortal: typeof SheetPrimitive.Portal = SheetPrimitive.Portal

export function SheetTrigger(props: SheetPrimitive.Trigger.Props): React.ReactElement {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

export function SheetClose(props: SheetPrimitive.Close.Props): React.ReactElement {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

export function SheetBackdrop({
  className,
  sx,
  ...props
}: SheetPrimitive.Backdrop.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.backdrop, sx)

  return (
    <SheetPrimitive.Backdrop
      className={cn(styleProps.className, className)}
      data-slot="sheet-backdrop"
      style={styleProps.style}
      {...props}
    />
  )
}

export function SheetViewport({
  className,
  side,
  variant = "default",
  sx,
  ...props
}: SheetPrimitive.Viewport.Props & {
  side?: SheetSide
  variant?: SheetVariant
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(
    styles.viewport,
    side && viewportSideStyles[side],
    variant === "inset" && viewportVariantStyles.inset,
    sx,
  )

  return (
    <SheetPrimitive.Viewport
      className={cn(styleProps.className, className)}
      data-slot="sheet-viewport"
      style={styleProps.style}
      {...props}
    />
  )
}

export function SheetPopup({
  className,
  children,
  showCloseButton = true,
  side = "right",
  variant = "default",
  closeProps,
  portalProps,
  sx,
  ...props
}: SheetPrimitive.Popup.Props & {
  showCloseButton?: boolean
  side?: SheetSide
  variant?: SheetVariant
  closeProps?: SheetPrimitive.Close.Props
  portalProps?: SheetPrimitive.Portal.Props
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(
    styles.popup,
    popupSideStyles[side],
    variant === "inset" && popupVariantStyles.inset,
    sx,
  )

  return (
    <SheetPortal {...portalProps}>
      <SheetBackdrop />
      <SheetViewport side={side} variant={variant}>
        <SheetPrimitive.Popup
          className={cn(styleProps.className, className)}
          data-slot="sheet-popup"
          data-variant={variant}
          style={styleProps.style}
          {...props}
        >
          {children}
          {showCloseButton && (
            <SheetPrimitive.Close
              aria-label="Close"
              render={<Button size="icon" sx={styles.closeButton} variant="ghost" />}
              {...closeProps}
            >
              <Close />
            </SheetPrimitive.Close>
          )}
        </SheetPrimitive.Popup>
      </SheetViewport>
    </SheetPortal>
  )
}

export function SheetHeader({
  className,
  render,
  sx,
  ...props
}: useRender.ComponentProps<"div"> & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.header, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "sheet-header",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function SheetFooter({
  className,
  variant = "default",
  render,
  sx,
  ...props
}: useRender.ComponentProps<"div"> & {
  variant?: "default" | "bare"
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(
    styles.footer,
    variant === "default" && styles.footerDefault,
    variant === "bare" && styles.footerBare,
    sx,
  )
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "sheet-footer",
    "data-variant": variant,
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function SheetTitle({
  className,
  sx,
  ...props
}: SheetPrimitive.Title.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.title, sx)

  return (
    <SheetPrimitive.Title
      className={cn(styleProps.className, className)}
      data-slot="sheet-title"
      style={styleProps.style}
      {...props}
    />
  )
}

export function SheetDescription({
  className,
  sx,
  ...props
}: SheetPrimitive.Description.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.description, sx)

  return (
    <SheetPrimitive.Description
      className={cn(styleProps.className, className)}
      data-slot="sheet-description"
      style={styleProps.style}
      {...props}
    />
  )
}

export function SheetPanel({
  className,
  scrollFade = true,
  render,
  sx,
  ...props
}: useRender.ComponentProps<"div"> & {
  scrollFade?: boolean
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.panel, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "sheet-panel",
    style: styleProps.style,
  }

  return (
    <ScrollArea scrollFade={scrollFade}>
      {useRender({
        defaultTagName: "div",
        props: mergeProps<"div">(defaultProps, props),
        render,
      })}
    </ScrollArea>
  )
}

export { SheetPrimitive, SheetBackdrop as SheetOverlay, SheetPopup as SheetContent }
