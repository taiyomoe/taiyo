import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/utils/cn"
import { colors, consts, font, radius, shadows, text } from "../../styles/tokens.stylex"
import { surface } from "../../styles/recipes"
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
  header: {
    padding: "1.5rem",
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    textAlign: {
      default: "center",
      [consts.sm]: "left",
    },
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
})

export const AlertDialogCreateHandle: typeof AlertDialogPrimitive.createHandle =
  AlertDialogPrimitive.createHandle

export const AlertDialog: typeof AlertDialogPrimitive.Root = AlertDialogPrimitive.Root

export const AlertDialogPortal: typeof AlertDialogPrimitive.Portal = AlertDialogPrimitive.Portal

export function AlertDialogTrigger(props: AlertDialogPrimitive.Trigger.Props): React.ReactElement {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

export function AlertDialogBackdrop({
  className,
  sx,
  ...props
}: AlertDialogPrimitive.Backdrop.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.backdrop, sx)

  return (
    <AlertDialogPrimitive.Backdrop
      className={cn(styleProps.className, className)}
      data-slot="alert-dialog-backdrop"
      style={styleProps.style}
      {...props}
    />
  )
}

export function AlertDialogViewport({
  className,
  sx,
  ...props
}: AlertDialogPrimitive.Viewport.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.viewport, sx)

  return (
    <AlertDialogPrimitive.Viewport
      className={cn(styleProps.className, className)}
      data-slot="alert-dialog-viewport"
      style={styleProps.style}
      {...props}
    />
  )
}

export function AlertDialogPopup({
  className,
  bottomStickOnMobile = true,
  portalProps,
  sx,
  ...props
}: AlertDialogPrimitive.Popup.Props & {
  bottomStickOnMobile?: boolean
  portalProps?: AlertDialogPrimitive.Portal.Props
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(
    surface.raisedEdge,
    styles.popup,
    bottomStickOnMobile && styles.popupBottomStick,
    sx,
  )

  return (
    <AlertDialogPortal {...portalProps}>
      <AlertDialogBackdrop />
      <AlertDialogViewport sx={bottomStickOnMobile ? styles.viewportBottomStick : undefined}>
        <AlertDialogPrimitive.Popup
          className={cn(styleProps.className, className)}
          data-slot="alert-dialog-popup"
          style={styleProps.style}
          {...props}
        />
      </AlertDialogViewport>
    </AlertDialogPortal>
  )
}

export function AlertDialogHeader({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.header, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-slot="alert-dialog-header"
      style={styleProps.style}
      {...props}
    />
  )
}

export function AlertDialogFooter({
  className,
  variant = "default",
  sx,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "bare"
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(
    styles.footer,
    variant === "default" && styles.footerDefault,
    variant === "bare" && styles.footerBare,
    sx,
  )

  return (
    <div
      className={cn(styleProps.className, className)}
      data-slot="alert-dialog-footer"
      data-variant={variant}
      style={styleProps.style}
      {...props}
    />
  )
}

export function AlertDialogTitle({
  className,
  sx,
  ...props
}: AlertDialogPrimitive.Title.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.title, sx)

  return (
    <AlertDialogPrimitive.Title
      className={cn(styleProps.className, className)}
      data-slot="alert-dialog-title"
      style={styleProps.style}
      {...props}
    />
  )
}

export function AlertDialogDescription({
  className,
  sx,
  ...props
}: AlertDialogPrimitive.Description.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.description, sx)

  return (
    <AlertDialogPrimitive.Description
      className={cn(styleProps.className, className)}
      data-slot="alert-dialog-description"
      style={styleProps.style}
      {...props}
    />
  )
}

export function AlertDialogClose(props: AlertDialogPrimitive.Close.Props): React.ReactElement {
  return <AlertDialogPrimitive.Close data-slot="alert-dialog-close" {...props} />
}

export {
  AlertDialogPrimitive,
  AlertDialogBackdrop as AlertDialogOverlay,
  AlertDialogPopup as AlertDialogContent,
}
