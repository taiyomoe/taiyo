"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
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
    padding: "1rem",
    display: "grid",
    gridTemplateRows: "1fr auto 3fr",
    justifyItems: "center",
    position: "fixed",
    zIndex: 50,
  },
  viewportBottomStick: {
    padding: {
      default: "1rem",
      "@media (width < 40rem)": 0,
    },
    gridTemplateRows: {
      default: "1fr auto 3fr",
      "@media (width < 40rem)": "1fr auto",
    },
    paddingTop: {
      default: null,
      "@media (width < 40rem)": "3rem",
    },
  },
  popup: {
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.popover,
    boxShadow: shadows.overlay,
    color: colors.popoverForeground,
    display: "flex",
    flexDirection: "column",
    gridRowStart: "2",
    // CSS calc() requires whitespace around the operators; without it the
    // whole declaration is dropped and the nested-dialog dim never runs.
    opacity: {
      "[data-ending-style]": 0,
      "[data-starting-style]": 0,
      default: "calc(1 - var(--nested-dialogs))",
    },
    outlineStyle: "none",
    position: "relative",
    scale: {
      default: null,
      [consts.sm]: {
        "[data-ending-style]": "98%",
        "[data-starting-style]": "98%",
        default: "calc(1 - 0.1 * var(--nested-dialogs))",
      },
    },
    transformOrigin: "center",
    transitionDuration: "200ms",
    transitionProperty: "scale, opacity, translate",
    transitionTimingFunction: "ease-in-out",
    willChange: "transform",
    maxHeight: "100%",
    maxWidth: "32rem",
    minHeight: 0,
    minWidth: 0,
    width: "100%",
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: shadows.edge,
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
  popupBottomStick: {
    borderRadius: {
      default: radius.xxl,
      "@media (width < 40rem)": 0,
    },
    transformOrigin: {
      default: "center",
      "@media (width < 40rem)": "bottom",
    },
    translate: {
      default: null,
      "@media (width < 40rem)": {
        "[data-ending-style]": "0 1rem",
        "[data-starting-style]": "0 1rem",
        default: null,
      },
    },
    borderBottomWidth: {
      default: null,
      "@media (width < 40rem)": 0,
    },
    borderLeftWidth: {
      default: null,
      "@media (width < 40rem)": 0,
    },
    borderRightWidth: {
      default: null,
      "@media (width < 40rem)": 0,
    },
    maxWidth: {
      default: "32rem",
      "@media (width < 40rem)": "none",
    },
    "::before": {
      display: {
        default: null,
        "@media (width < 40rem)": "none",
      },
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
    borderBottomLeftRadius: {
      default: null,
      [consts.sm]: `calc(${radius.xxl} - 1px)`,
    },
    borderBottomRightRadius: {
      default: null,
      [consts.sm]: `calc(${radius.xxl} - 1px)`,
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

export const DialogCreateHandle: typeof DialogPrimitive.createHandle = DialogPrimitive.createHandle

export const Dialog: typeof DialogPrimitive.Root = DialogPrimitive.Root

export const DialogPortal: typeof DialogPrimitive.Portal = DialogPrimitive.Portal

export function DialogTrigger(props: DialogPrimitive.Trigger.Props): React.ReactElement {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

export function DialogClose(props: DialogPrimitive.Close.Props): React.ReactElement {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

export function DialogBackdrop({
  className,
  sx,
  ...props
}: DialogPrimitive.Backdrop.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.backdrop, sx)

  return (
    <DialogPrimitive.Backdrop
      className={cn(styleProps.className, className)}
      data-slot="dialog-backdrop"
      style={styleProps.style}
      {...props}
    />
  )
}

export function DialogViewport({
  className,
  sx,
  ...props
}: DialogPrimitive.Viewport.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.viewport, sx)

  return (
    <DialogPrimitive.Viewport
      className={cn(styleProps.className, className)}
      data-slot="dialog-viewport"
      style={styleProps.style}
      {...props}
    />
  )
}

export function DialogPopup({
  className,
  children,
  showCloseButton = true,
  bottomStickOnMobile = true,
  closeProps,
  portalProps,
  sx,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
  bottomStickOnMobile?: boolean
  closeProps?: DialogPrimitive.Close.Props
  portalProps?: DialogPrimitive.Portal.Props
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.popup, bottomStickOnMobile && styles.popupBottomStick, sx)

  return (
    <DialogPortal {...portalProps}>
      <DialogBackdrop />
      <DialogViewport sx={bottomStickOnMobile ? styles.viewportBottomStick : undefined}>
        <DialogPrimitive.Popup
          className={cn(styleProps.className, className)}
          data-slot="dialog-popup"
          style={styleProps.style}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              aria-label="Close"
              render={<Button size="icon" sx={styles.closeButton} variant="ghost" />}
              {...closeProps}
            >
              <Close />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Popup>
      </DialogViewport>
    </DialogPortal>
  )
}

export function DialogHeader({
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
    "data-slot": "dialog-header",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function DialogFooter({
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
    "data-slot": "dialog-footer",
    "data-variant": variant,
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function DialogTitle({
  className,
  sx,
  ...props
}: DialogPrimitive.Title.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.title, sx)

  return (
    <DialogPrimitive.Title
      className={cn(styleProps.className, className)}
      data-slot="dialog-title"
      style={styleProps.style}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  sx,
  ...props
}: DialogPrimitive.Description.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.description, sx)

  return (
    <DialogPrimitive.Description
      className={cn(styleProps.className, className)}
      data-slot="dialog-description"
      style={styleProps.style}
      {...props}
    />
  )
}

export function DialogPanel({
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
    "data-slot": "dialog-panel",
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

export { DialogPrimitive, DialogBackdrop as DialogOverlay, DialogPopup as DialogContent }
