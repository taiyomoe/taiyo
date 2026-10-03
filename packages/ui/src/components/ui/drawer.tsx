import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"
import { mergeProps } from "@base-ui/react/merge-props"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { createContext, useContext, useMemo } from "react"
import { cn } from "@/utils/cn"
import { ChevronRight, Close } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { drawerSwitchItemMarker } from "../../styles/markers.stylex"
import type { Sx } from "../../styles/sx"
import { colors, consts, font, radius, shadows, text } from "../../styles/tokens.stylex"

type DrawerPosition = "right" | "left" | "top" | "bottom"
type DrawerVariant = "default" | "straight" | "inset"

const DrawerContext: React.Context<{ position: DrawerPosition }> = createContext<{
  position: DrawerPosition
}>({
  position: "bottom",
})
const directionMap: Record<DrawerPosition, DrawerPrimitive.Root.Props["swipeDirection"]> = {
  bottom: "down",
  left: "left",
  right: "right",
  top: "up",
}
const styles = stylex.create({
  backdrop: {
    inset: 0,
    backdropFilter: "blur(4px)",
    backgroundColor: "rgb(0 0 0 / 32%)",
    opacity: {
      "[data-ending-style]": 0,
      "[data-starting-style]": 0,
      default: "calc(1 - var(--drawer-swipe-progress))",
    },
    position: "fixed",
    transitionDuration: {
      "[data-ending-style]": "calc(var(--drawer-swipe-strength) * 400ms)",
      "[data-swiping]": "0s",
      default: "450ms",
    },
    transitionProperty: "opacity",
    transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
    zIndex: 50,
  },
  viewport: {
    "--bleed": "3rem",
    "--inset": "0px",
    inset: 0,
    position: "fixed",
    touchAction: "none",
    zIndex: 50,
  },
  viewportBottom: {
    display: "grid",
    gridTemplateRows: "1fr auto",
    paddingTop: "3rem",
  },
  viewportTop: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    paddingBottom: "3rem",
  },
  viewportLeft: { display: "flex", justifyContent: "flex-start" },
  viewportRight: { display: "flex", justifyContent: "flex-end" },
  viewportInset: {
    "--inset": {
      default: "0px",
      [consts.sm]: "1rem",
    },
    paddingInline: "var(--inset)",
  },
  viewportInsetTop: { paddingTop: "var(--inset)" },
  viewportInsetBottom: { paddingBottom: "var(--inset)" },
  popup: {
    "--peek": "calc(1.5rem - 1px)",
    "--scale": "clamp(0, calc(var(--scale-base) + (var(--stack-step) * var(--stack-progress))), 1)",
    "--scale-base": "calc(max(0, 1 - (var(--nested-drawers) * var(--stack-step))))",
    "--shrink": "calc(1 - var(--scale))",
    "--stack-peek-offset":
      "max(0px, calc((var(--nested-drawers) - var(--stack-progress)) * var(--peek)))",
    "--stack-progress": "clamp(0, var(--drawer-swipe-progress), 1)",
    "--stack-step": "0.05",
    borderColor: colors.border,
    borderStyle: "solid",
    borderWidth: 0,
    overflow: {
      "[data-nested-drawer-open]": "hidden",
      default: null,
    },
    backgroundClip: "padding-box",
    backgroundColor: {
      "[data-nested-drawer-open]": `color-mix(in srgb, ${colors.popover}, #000 calc(4% * (var(--nested-drawers) - var(--stack-progress))))`,
      default: colors.popover,
    },
    boxShadow: {
      "[data-ending-style]": "0 0 transparent",
      "[data-starting-style]": "0 0 transparent",
      default: shadows.overlay,
    },
    color: colors.popoverForeground,
    display: "flex",
    flexDirection: "column",
    outlineStyle: "none",
    position: "relative",
    touchAction: "none",
    transitionDuration: {
      "[data-ending-style]": "calc(var(--drawer-swipe-strength) * 400ms)",
      default: "450ms",
    },
    transitionProperty: "transform, box-shadow, height, background-color",
    transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
    userSelect: {
      "[data-swiping]": "none",
      default: null,
    },
    willChange: "transform",
    maxHeight: "100%",
    minHeight: 0,
    minWidth: 0,
    width: "100%",
    // The bleed layer paints past the edge so an overscroll never shows the
    // page behind the drawer.
    "::after": {
      backgroundColor: colors.popover,
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
    "::before": {
      inset: 0,
      boxShadow: shadows.edge,
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
  popupBottom: {
    "--height": "max(0px, calc(var(--drawer-frontmost-height, var(--drawer-height))))",
    gridRowStart: "2",
    transform: {
      "[data-ending-style]":
        "translateY(calc(100% + env(safe-area-inset-bottom, 0px) + var(--inset)))",
      "[data-nested-drawer-open]":
        "translateY(calc(var(--drawer-swipe-movement-y) - var(--stack-peek-offset) - (var(--shrink) * var(--height)))) scale(var(--scale))",
      "[data-starting-style]":
        "translateY(calc(100% + env(safe-area-inset-bottom, 0px) + var(--inset)))",
      default: "translateY(calc(var(--drawer-snap-point-offset) + var(--drawer-swipe-movement-y)))",
    },
    transformOrigin: "50% calc(100% - var(--inset))",
    borderTopWidth: 1,
    height: {
      "[data-nested-drawer-open]": "var(--height)",
      default: "var(--drawer-height, auto)",
    },
    marginBottom: {
      "[data-ending-style]": 0,
      "[data-starting-style]": 0,
      default:
        "-max(0px, calc(var(--drawer-snap-point-offset, 0px) + clamp(0, 1, var(--drawer-snap-point-offset, 0px) / 1px) * var(--drawer-swipe-movement-y, 0px)))",
    },
    paddingBottom: {
      "[data-ending-style]": 0,
      "[data-starting-style]": 0,
      default:
        "max(0px, calc(env(safe-area-inset-bottom, 0px) + var(--drawer-snap-point-offset, 0px) + clamp(0, 1, var(--drawer-snap-point-offset, 0px) / 1px) * var(--drawer-swipe-movement-y, 0px)))",
    },
    "::after": {
      insetInline: 0,
      height: "var(--bleed)",
      top: "100%",
    },
  },
  popupTop: {
    "--height": "max(0px, calc(var(--drawer-frontmost-height, var(--drawer-height))))",
    transform: {
      "[data-ending-style]": "translateY(calc(-100% - var(--inset)))",
      "[data-nested-drawer-open]":
        "translateY(calc(var(--drawer-swipe-movement-y) + var(--stack-peek-offset) + (var(--shrink) * var(--height)))) scale(var(--scale))",
      "[data-starting-style]": "translateY(calc(-100% - var(--inset)))",
      default: "translateY(var(--drawer-swipe-movement-y))",
    },
    transformOrigin: "50% var(--inset)",
    borderBottomWidth: 1,
    height: {
      "[data-nested-drawer-open]": "var(--height)",
      default: "var(--drawer-height, auto)",
    },
    "::after": {
      insetInline: 0,
      bottom: "100%",
      height: "var(--bleed)",
    },
  },
  popupLeft: {
    transform: {
      "[data-ending-style]": "translateX(calc(-100% - var(--inset)))",
      "[data-nested-drawer-open]":
        "translateX(calc(var(--drawer-swipe-movement-x) + var(--stack-peek-offset))) scale(var(--scale))",
      "[data-starting-style]": "translateX(calc(-100% - var(--inset)))",
      default: "translateX(var(--drawer-swipe-movement-x))",
    },
    transformOrigin: "right",
    borderRightWidth: 1,
    maxWidth: "28rem",
    width: "calc(100% - 3rem)",
    "::after": {
      insetBlock: 0,
      right: "100%",
      width: "var(--bleed)",
    },
  },
  popupRight: {
    gridColumnStart: "2",
    transform: {
      "[data-ending-style]": "translateX(calc(100% + var(--inset)))",
      "[data-nested-drawer-open]":
        "translateX(calc(var(--drawer-swipe-movement-x) - var(--stack-peek-offset))) scale(var(--scale))",
      "[data-starting-style]": "translateX(calc(100% + var(--inset)))",
      default: "translateX(var(--drawer-swipe-movement-x))",
    },
    transformOrigin: "left",
    borderLeftWidth: 1,
    maxWidth: "28rem",
    width: "calc(100% - 3rem)",
    "::after": {
      insetBlock: 0,
      left: "100%",
      width: "var(--bleed)",
    },
  },
  popupRoundedBottom: {
    borderStartEndRadius: radius.xxl,
    borderStartStartRadius: radius.xxl,
  },
  popupRoundedTop: {
    borderEndEndRadius: radius.xxl,
    borderEndStartRadius: radius.xxl,
  },
  popupRoundedLeft: {
    borderEndEndRadius: radius.xxl,
    borderStartEndRadius: radius.xxl,
  },
  popupRoundedRight: {
    borderEndStartRadius: radius.xxl,
    borderStartStartRadius: radius.xxl,
  },
  popupEdgeBottom: {
    "::before": {
      borderStartEndRadius: "calc(1.575rem - 1px)",
      borderStartStartRadius: "calc(1.575rem - 1px)",
    },
  },
  popupEdgeTop: {
    "::before": {
      borderEndEndRadius: "calc(1.575rem - 1px)",
      borderEndStartRadius: "calc(1.575rem - 1px)",
    },
  },
  popupEdgeLeft: {
    "::before": {
      borderEndEndRadius: "calc(1.575rem - 1px)",
      borderStartEndRadius: "calc(1.575rem - 1px)",
    },
  },
  popupEdgeRight: {
    "::before": {
      borderEndStartRadius: "calc(1.575rem - 1px)",
      borderStartStartRadius: "calc(1.575rem - 1px)",
    },
  },
  popupInset: {
    borderRadius: {
      default: null,
      [consts.sm]: radius.xxl,
    },
    borderWidth: {
      default: null,
      [consts.sm]: 1,
    },
    "::after": {
      backgroundColor: {
        default: colors.popover,
        [consts.sm]: "transparent",
      },
    },
    "::before": {
      display: "none",
    },
  },
  popupStraight: {
    "--stack-step": "0",
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
    paddingBottom: {
      default: "1rem",
      [consts.sm]: "1.5rem",
    },
  },
  noSelection: {
    cursor: "default",
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
    paddingBottom: "var(--safe-area-inset-bottom, 0px)",
  },
  footerDefault: {
    backgroundColor: `color-mix(in srgb, ${colors.muted} 72%, transparent)`,
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
    paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
    paddingTop: "1rem",
  },
  footerBare: {
    paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)",
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
    padding: "1.5rem",
  },
  scrollArea: {
    touchAction: "auto",
  },
  bar: {
    padding: "0.75rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    position: "absolute",
    touchAction: "none",
    "::before": {
      borderRadius: radius.full,
      backgroundColor: colors.input,
      content: '""',
    },
  },
  barHorizontal: {
    insetBlock: 0,
    "::before": { height: "3rem", width: "0.25rem" },
  },
  barVertical: {
    insetInline: 0,
    "::before": { height: "0.25rem", width: "3rem" },
  },
  barTop: { bottom: 0 },
  barBottom: { top: 0 },
  barLeft: { right: 0 },
  barRight: { left: 0 },
  swipeArea: {
    position: "fixed",
    touchAction: "none",
    zIndex: 50,
  },
  swipeAreaBottom: { insetInline: 0, bottom: 0, height: "2rem" },
  swipeAreaTop: { insetInline: 0, height: "2rem", top: 0 },
  swipeAreaLeft: { insetBlock: 0, left: 0, width: "2rem" },
  swipeAreaRight: { insetBlock: 0, right: 0, width: "2rem" },
  menu: {
    margin: "-0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  menuItem: {
    borderRadius: radius.sm,
    gap: "0.5rem",
    paddingBlock: "0.25rem",
    paddingInline: "0.5rem",
    alignItems: "center",
    backgroundColor: {
      default: null,
      ":hover": colors.accent,
    },
    color: {
      '[data-variant="destructive"]': colors.destructiveForeground,
      default: colors.foreground,
      ":hover": colors.accentForeground,
    },
    cursor: "default",
    display: "flex",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    opacity: {
      "[data-disabled]": 0.64,
      default: null,
      ":disabled": 0.64,
    },
    outlineStyle: "none",
    pointerEvents: {
      "[data-disabled]": "none",
      default: null,
      ":disabled": "none",
    },
    userSelect: "none",
    minHeight: {
      default: "2.25rem",
      [consts.sm]: "2rem",
    },
    width: "100%",
  },
  menuItemCheckbox: {
    display: "grid",
    gridTemplateColumns: "1rem 1fr",
    paddingRight: "1rem",
  },
  menuItemSwitch: {
    gap: "1rem",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    paddingRight: "0.375rem",
  },
  menuSeparator: {
    marginBlock: "0.25rem",
    marginInline: "0.5rem",
    backgroundColor: colors.border,
    height: "1px",
  },
  menuGroup: {
    display: "flex",
    flexDirection: "column",
  },
  menuGroupLabel: {
    paddingBlock: "0.375rem",
    paddingInline: "0.5rem",
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 500,
    lineHeight: "1rem",
  },
  menuTriggerChevron: {
    opacity: 0.8,
    marginLeft: "auto",
    marginRight: "-0.125rem",
  },
  columnOne: { gridColumnStart: "1" },
  columnTwo: { gridColumnStart: "2" },
  switchTrack: {
    // The thumb reads --thumb-size back; see menu.tsx for why the breakpoint
    // has to live on the track.
    "--thumb-size": {
      default: "1rem",
      [consts.sm]: "0.75rem",
    },
    padding: "1px",
    borderRadius: radius.full,
    alignItems: "center",
    backgroundColor: {
      "[data-checked]": colors.primary,
      "[data-unchecked]": colors.well,
      default: null,
    },
    boxShadow: {
      "[data-unchecked]": `inset 0 1px rgb(0 0 0 / 4%), ${shadows.sunken}`,
      default: "inset 0 1px rgb(0 0 0 / 4%)",
    },
    display: "inline-flex",
    flexShrink: 0,
    gridColumnStart: "2",
    opacity: {
      "[data-disabled]": 0.64,
      default: null,
    },
    outlineColor: colors.ring,
    outlineOffset: 1,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
    transitionDuration: "200ms",
    transitionProperty: "background-color, box-shadow",
    height: "calc(var(--thumb-size) + 2px)",
    width: "calc(var(--thumb-size) * 2 - 2px)",
  },
  switchThumb: {
    borderRadius: {
      default: "var(--thumb-size)",
      [stylex.when.ancestor(":active", drawerSwitchItemMarker)]:
        "var(--thumb-size) / calc(var(--thumb-size) * 1.1)",
    },
    aspectRatio: "1",
    backgroundColor: "#fff",
    boxShadow: shadows.thumb,
    display: "block",
    pointerEvents: "none",
    scale: {
      default: null,
      [stylex.when.ancestor(":active", drawerSwitchItemMarker)]: "1.1 1",
    },
    transformOrigin: {
      default: "left",
      [stylex.when.ancestor("[data-checked]", drawerSwitchItemMarker)]: "var(--thumb-size) 50%",
    },
    transitionDelay: "0s, 0s, 0.1s, 0s",
    transitionDuration: "0.15s, 0.15s, 0.1s, 0.15s",
    transitionProperty: "translate, border-radius, scale, transform-origin",
    translate: {
      default: null,
      [stylex.when.ancestor("[data-checked]", drawerSwitchItemMarker)]:
        "calc(var(--thumb-size) - 4px)",
    },
    willChange: "transform",
    height: "100%",
  },
  indicatorIcon: {
    height: {
      default: "1.125rem",
      [consts.sm]: "1rem",
    },
    width: {
      default: "1.125rem",
      [consts.sm]: "1rem",
    },
  },
})

export const DrawerCreateHandle: typeof DrawerPrimitive.createHandle = DrawerPrimitive.createHandle

export function Drawer({
  swipeDirection,
  position = "bottom",
  ...props
}: DrawerPrimitive.Root.Props & {
  position?: DrawerPosition
}): React.ReactElement {
  const contextValue = useMemo(() => ({ position }), [position])

  return (
    <DrawerContext.Provider value={contextValue}>
      <DrawerPrimitive.Root swipeDirection={swipeDirection ?? directionMap[position]} {...props} />
    </DrawerContext.Provider>
  )
}

export const DrawerPortal: typeof DrawerPrimitive.Portal = DrawerPrimitive.Portal

export function DrawerTrigger(props: DrawerPrimitive.Trigger.Props): React.ReactElement {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

export function DrawerClose(props: DrawerPrimitive.Close.Props): React.ReactElement {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

const SWIPE_AREA_STYLE = {
  bottom: styles.swipeAreaBottom,
  left: styles.swipeAreaLeft,
  right: styles.swipeAreaRight,
  top: styles.swipeAreaTop,
} as const

export function DrawerSwipeArea({
  className,
  position: positionProp,
  sx,
  ...props
}: DrawerPrimitive.SwipeArea.Props & {
  position?: DrawerPosition
  sx?: Sx
}): React.ReactElement {
  const { position: contextPosition } = useContext(DrawerContext)
  const position = positionProp ?? contextPosition
  const styleProps = stylex.props(styles.swipeArea, SWIPE_AREA_STYLE[position], sx)

  return (
    <DrawerPrimitive.SwipeArea
      className={cn(styleProps.className, className)}
      data-slot="drawer-swipe-area"
      style={styleProps.style}
      {...props}
    />
  )
}

export function DrawerBackdrop({
  className,
  sx,
  ...props
}: DrawerPrimitive.Backdrop.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.backdrop, sx)

  return (
    <DrawerPrimitive.Backdrop
      className={cn(styleProps.className, className)}
      data-slot="drawer-backdrop"
      style={styleProps.style}
      {...props}
    />
  )
}

const VIEWPORT_STYLE = {
  bottom: styles.viewportBottom,
  left: styles.viewportLeft,
  right: styles.viewportRight,
  top: styles.viewportTop,
} as const

export function DrawerViewport({
  className,
  position = "bottom",
  variant = "default",
  sx,
  ...props
}: DrawerPrimitive.Viewport.Props & {
  position?: DrawerPosition
  variant?: DrawerVariant
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(
    styles.viewport,
    VIEWPORT_STYLE[position],
    variant === "inset" && styles.viewportInset,
    variant === "inset" && position !== "bottom" && styles.viewportInsetTop,
    variant === "inset" && position !== "top" && styles.viewportInsetBottom,
    sx,
  )

  return (
    <DrawerPrimitive.Viewport
      className={cn(styleProps.className, className)}
      data-slot="drawer-viewport"
      style={styleProps.style}
      {...props}
    />
  )
}

const POPUP_POSITION_STYLE = {
  bottom: styles.popupBottom,
  left: styles.popupLeft,
  right: styles.popupRight,
  top: styles.popupTop,
} as const
const POPUP_ROUNDED_STYLE = {
  bottom: styles.popupRoundedBottom,
  left: styles.popupRoundedLeft,
  right: styles.popupRoundedRight,
  top: styles.popupRoundedTop,
} as const
const POPUP_EDGE_STYLE = {
  bottom: styles.popupEdgeBottom,
  left: styles.popupEdgeLeft,
  right: styles.popupEdgeRight,
  top: styles.popupEdgeTop,
} as const

export function DrawerPopup({
  className,
  children,
  showCloseButton = false,
  position: positionProp,
  variant = "default",
  showBar = false,
  portalProps,
  sx,
  ...props
}: DrawerPrimitive.Popup.Props & {
  showCloseButton?: boolean
  position?: DrawerPosition
  variant?: DrawerVariant
  showBar?: boolean
  portalProps?: DrawerPrimitive.Portal.Props
  sx?: Sx
}): React.ReactElement {
  const { position: contextPosition } = useContext(DrawerContext)
  const position = positionProp ?? contextPosition
  const styleProps = stylex.props(
    styles.popup,
    POPUP_POSITION_STYLE[position],
    variant !== "straight" && POPUP_ROUNDED_STYLE[position],
    variant === "default" && POPUP_EDGE_STYLE[position],
    variant === "inset" && styles.popupInset,
    variant === "straight" && styles.popupStraight,
    sx,
  )
  const closeProps = stylex.props(styles.closeButton)

  return (
    <DrawerPortal {...portalProps}>
      <DrawerBackdrop />
      <DrawerViewport position={position} variant={variant}>
        <DrawerPrimitive.Popup
          className={cn(styleProps.className, className)}
          data-position={position}
          data-slot="drawer-popup"
          data-variant={variant}
          style={styleProps.style}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DrawerPrimitive.Close
              aria-label="Close"
              className={closeProps.className}
              render={<Button size="icon" variant="ghost" />}
              style={closeProps.style}
            >
              <Close />
            </DrawerPrimitive.Close>
          )}
          {showBar && <DrawerBar />}
        </DrawerPrimitive.Popup>
      </DrawerViewport>
    </DrawerPortal>
  )
}

export function DrawerHeader({
  className,
  allowSelection = false,
  render,
  sx,
  ...props
}: useRender.ComponentProps<"div"> & {
  allowSelection?: boolean
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.header, !allowSelection && styles.noSelection, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "drawer-header",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render: allowSelection ? <DrawerContent render={render} /> : render,
  })
}

export function DrawerFooter({
  className,
  variant = "default",
  allowSelection = true,
  render,
  sx,
  ...props
}: useRender.ComponentProps<"div"> & {
  variant?: "default" | "bare"
  allowSelection?: boolean
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(
    styles.footer,
    variant === "default" ? styles.footerDefault : styles.footerBare,
    !allowSelection && styles.noSelection,
    sx,
  )
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "drawer-footer",
    "data-variant": variant,
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render: allowSelection ? <DrawerContent render={render} /> : render,
  })
}

export function DrawerTitle({
  className,
  sx,
  ...props
}: DrawerPrimitive.Title.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.title, sx)

  return (
    <DrawerPrimitive.Title
      className={cn(styleProps.className, className)}
      data-slot="drawer-title"
      style={styleProps.style}
      {...props}
    />
  )
}

export function DrawerDescription({
  className,
  sx,
  ...props
}: DrawerPrimitive.Description.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.description, sx)

  return (
    <DrawerPrimitive.Description
      className={cn(styleProps.className, className)}
      data-slot="drawer-description"
      style={styleProps.style}
      {...props}
    />
  )
}

export function DrawerPanel({
  className,
  scrollFade = true,
  scrollable = true,
  allowSelection = true,
  render,
  sx,
  ...props
}: useRender.ComponentProps<"div"> & {
  scrollFade?: boolean
  scrollable?: boolean
  allowSelection?: boolean
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.panel, !allowSelection && styles.noSelection, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "drawer-panel",
    style: styleProps.style,
  }
  const content = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render: allowSelection ? <DrawerContent render={render} /> : render,
  })

  if (scrollable) {
    return (
      <ScrollArea scrollFade={scrollFade} sx={styles.scrollArea}>
        {content}
      </ScrollArea>
    )
  }

  return content
}

const BAR_ANCHOR_STYLE = {
  bottom: styles.barBottom,
  left: styles.barLeft,
  right: styles.barRight,
  top: styles.barTop,
} as const

export function DrawerBar({
  className,
  position: positionProp,
  render,
  sx,
  ...props
}: useRender.ComponentProps<"div"> & {
  position?: DrawerPosition
  sx?: Sx
}): React.ReactElement {
  const { position: contextPosition } = useContext(DrawerContext)
  const position = positionProp ?? contextPosition
  const horizontal = position === "left" || position === "right"
  const styleProps = stylex.props(
    styles.bar,
    horizontal ? styles.barHorizontal : styles.barVertical,
    BAR_ANCHOR_STYLE[position],
    sx,
  )
  const defaultProps = {
    "aria-hidden": true as const,
    className: cn(styleProps.className, className),
    "data-slot": "drawer-bar",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export const DrawerContent: typeof DrawerPrimitive.Content = DrawerPrimitive.Content

export function DrawerMenu({
  className,
  render,
  sx,
  ...props
}: useRender.ComponentProps<"nav"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.menu, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "drawer-menu",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "nav",
    props: mergeProps<"nav">(defaultProps, props),
    render,
  })
}

export function DrawerMenuItem({
  className,
  variant = "default",
  render,
  disabled,
  sx,
  ...props
}: useRender.ComponentProps<"button"> & {
  variant?: "default" | "destructive"
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.menuItem, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "drawer-menu-item",
    "data-variant": variant,
    disabled,
    style: styleProps.style,
    type: "button" as const,
  }

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(defaultProps, props),
    render,
  })
}

export function DrawerMenuSeparator({
  className,
  render,
  sx,
  ...props
}: useRender.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.menuSeparator, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "drawer-menu-separator",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function DrawerMenuGroup({
  className,
  render,
  sx,
  ...props
}: useRender.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.menuGroup, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "drawer-menu-group",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function DrawerMenuGroupLabel({
  className,
  render,
  sx,
  ...props
}: useRender.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.menuGroupLabel, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-slot": "drawer-menu-group-label",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export function DrawerMenuTrigger({
  className,
  children,
  sx,
  ...props
}: DrawerPrimitive.Trigger.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.menuItem, sx)
  const chevronProps = stylex.props(styles.menuTriggerChevron, styles.indicatorIcon)

  return (
    <DrawerTrigger
      className={cn(styleProps.className, className)}
      data-slot="drawer-menu-trigger"
      style={styleProps.style}
      {...props}
    >
      {children}
      <ChevronRight className={chevronProps.className} style={chevronProps.style} />
    </DrawerTrigger>
  )
}

export function DrawerMenuCheckboxItem({
  className,
  children,
  checked,
  defaultChecked,
  onCheckedChange,
  variant = "default",
  disabled,
  render,
  sx,
  ...props
}: CheckboxPrimitive.Root.Props & {
  variant?: "default" | "switch"
  render?: React.ReactElement
  sx?: Sx
}): React.ReactElement {
  const isSwitch = variant === "switch"
  const styleProps = stylex.props(
    styles.menuItem,
    isSwitch ? styles.menuItemSwitch : styles.menuItemCheckbox,
    isSwitch && drawerSwitchItemMarker,
    isSwitch && stylex.defaultMarker(),
    sx,
  )
  const labelProps = stylex.props(isSwitch ? styles.columnOne : styles.columnTwo)
  const trackProps = stylex.props(styles.switchTrack)
  const thumbProps = stylex.props(styles.switchThumb)
  const indicatorProps = stylex.props(styles.columnOne)
  const iconProps = stylex.props(styles.indicatorIcon)

  return (
    <CheckboxPrimitive.Root
      checked={checked}
      className={cn(styleProps.className, className)}
      data-slot="drawer-menu-checkbox-item"
      defaultChecked={defaultChecked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      render={render}
      style={styleProps.style}
      {...props}
    >
      {isSwitch ? (
        <>
          <span className={labelProps.className} style={labelProps.style}>
            {children}
          </span>
          <CheckboxPrimitive.Indicator
            className={trackProps.className}
            keepMounted
            style={trackProps.style}
          >
            <span className={thumbProps.className} style={thumbProps.style} />
          </CheckboxPrimitive.Indicator>
        </>
      ) : (
        <>
          <CheckboxPrimitive.Indicator
            className={indicatorProps.className}
            style={indicatorProps.style}
          >
            <svg
              className={iconProps.className}
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              style={iconProps.style}
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
            </svg>
          </CheckboxPrimitive.Indicator>
          <span className={labelProps.className} style={labelProps.style}>
            {children}
          </span>
        </>
      )}
    </CheckboxPrimitive.Root>
  )
}

export function DrawerMenuRadioGroup({
  className,
  sx,
  ...props
}: RadioGroupPrimitive.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.menuGroup, sx)

  return (
    <RadioGroupPrimitive
      className={cn(styleProps.className, className)}
      data-slot="drawer-menu-radio-group"
      style={styleProps.style}
      {...props}
    />
  )
}

export function DrawerMenuRadioItem({
  className,
  children,
  value,
  disabled,
  render,
  sx,
  ...props
}: RadioPrimitive.Root.Props & {
  value: string
  render?: React.ReactElement
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.menuItem, styles.menuItemCheckbox, sx)
  const indicatorProps = stylex.props(styles.columnOne)
  const labelProps = stylex.props(styles.columnTwo)
  const iconProps = stylex.props(styles.indicatorIcon)

  return (
    <RadioPrimitive.Root
      className={cn(styleProps.className, className)}
      data-slot="drawer-menu-radio-item"
      disabled={disabled}
      render={render}
      style={styleProps.style}
      value={value}
      {...props}
    >
      <RadioPrimitive.Indicator className={indicatorProps.className} style={indicatorProps.style}>
        <svg
          className={iconProps.className}
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          style={iconProps.style}
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
        </svg>
      </RadioPrimitive.Indicator>
      <span className={labelProps.className} style={labelProps.style}>
        {children}
      </span>
    </RadioPrimitive.Root>
  )
}

export { DrawerPrimitive }
