import { Toast } from "@base-ui/react/toast"
import * as stylex from "@stylexjs/stylex"
import type React from "react"

import { AlertCircle, AlertTriangle, CheckCircle, Info, Spinner } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { colors, consts, radius, shadows } from "../../styles/tokens.stylex"
import { surface } from "../../styles/recipes"

const TOAST_ICONS = {
  error: AlertCircle,
  info: Info,
  loading: Spinner,
  success: CheckCircle,
  warning: AlertTriangle,
} as const

type SwipeDirection = "up" | "down" | "left" | "right"

type ToastData = {
  rootProps?: Omit<
    React.ComponentProps<typeof Toast.Root>,
    "children" | "className" | "swipeDirection" | "toast"
  >
  tooltipStyle?: boolean
}

const successPulse = stylex.keyframes({
  "0%": { scale: "1" },
  "30%": { scale: "1.025" },
  "60%": { scale: "0.99" },
  "100%": { scale: "1" },
})
const errorShake = stylex.keyframes({
  "0%": { translate: "0 0" },
  "25%": { translate: "-3px 0" },
  "50%": { translate: "3px 0" },
  "75%": { translate: "-3px 0" },
  "100%": { translate: "0 0" },
})
const spin = stylex.keyframes({
  to: { rotate: "360deg" },
})
const styles = stylex.create({
  viewport: {
    "--toast-inset": {
      default: "1rem",
      [consts.sm]: "2rem",
    },
    marginInline: "auto",
    display: "flex",
    position: "fixed",
    zIndex: 60,
    maxWidth: "22.5rem",
    width: "calc(100% - var(--toast-inset) * 2)",
  },
  viewportTop: {
    top: "var(--toast-inset)",
  },
  viewportBottom: {
    bottom: "var(--toast-inset)",
  },
  viewportLeft: {
    left: "var(--toast-inset)",
  },
  viewportRight: {
    right: "var(--toast-inset)",
  },
  viewportCenter: {
    translate: "-50%",
    left: "50%",
  },
  root: {
    "--toast-calc-height": "var(--toast-frontmost-height, var(--toast-height))",
    "--toast-gap": "0.75rem",
    "--toast-peek": "0.75rem",
    "--toast-scale": "calc(max(0, 1 - (var(--toast-index) * .1)))",
    "--toast-shrink": "calc(1 - var(--toast-scale))",
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: {
      "[data-expanded]": colors.popover,
      default: `color-mix(in srgb, ${colors.popover}, #000 calc(4% * max(0, var(--toast-index, 0))))`,
    },
    boxShadow: shadows.overlay,
    color: colors.popoverForeground,
    opacity: {
      "[data-ending-style]": 0,
      "[data-limited]": 0,
      default: null,
    },
    position: "absolute",
    // z-index is set inline: it depends on --toast-index, and StyleX only
    // accepts numeric z-index values.
    transitionDuration: "0.5s, 0.5s, 0.15s, 0.5s",
    transitionProperty: "transform, opacity, height, background-color",
    transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
    userSelect: "none",
    height: {
      "[data-expanded]": "var(--toast-height)",
      default: "var(--toast-calc-height)",
    },
    width: "100%",
    // Fills the gap between stacked toasts so hovering the stack is seamless.
    "::after": {
      content: '""',
      position: "absolute",
      height: "calc(var(--toast-gap) + 1px)",
      left: 0,
      width: "100%",
    },
  },
  rootTop: {
    "--toast-calc-offset-y":
      "calc(var(--toast-offset-y) + var(--toast-index) * var(--toast-gap) + var(--toast-swipe-movement-y))",
    transform: {
      '[data-ending-style][data-swipe-direction="down"]':
        "translateY(calc(var(--toast-swipe-movement-y) + 100% + var(--toast-inset)))",
      '[data-ending-style][data-swipe-direction="left"]':
        "translateX(calc(var(--toast-swipe-movement-x) - 100% - var(--toast-inset))) translateY(var(--toast-calc-offset-y))",
      '[data-ending-style][data-swipe-direction="right"]':
        "translateX(calc(var(--toast-swipe-movement-x) + 100% + var(--toast-inset))) translateY(var(--toast-calc-offset-y))",
      '[data-ending-style][data-swipe-direction="up"]':
        "translateY(calc(var(--toast-swipe-movement-y) - 100% - var(--toast-inset)))",
      "[data-expanded]":
        "translateX(var(--toast-swipe-movement-x)) translateY(var(--toast-calc-offset-y))",
      "[data-starting-style]": "translateY(calc(-100% - var(--toast-inset)))",
      default:
        "translateX(var(--toast-swipe-movement-x)) translateY(calc(var(--toast-swipe-movement-y) + (var(--toast-index) * var(--toast-peek)) + (var(--toast-shrink) * var(--toast-calc-height)))) scale(var(--toast-scale))",
    },
    transformOrigin: "50% calc(50% - 50% * min(var(--toast-index, 0), 1))",
    bottom: "auto",
    top: 0,
    "::after": {
      top: "100%",
    },
  },
  rootBottom: {
    "--toast-calc-offset-y":
      "calc(var(--toast-offset-y) * -1 + var(--toast-index) * var(--toast-gap) * -1 + var(--toast-swipe-movement-y))",
    transform: {
      '[data-ending-style][data-swipe-direction="down"]':
        "translateY(calc(var(--toast-swipe-movement-y) + 100% + var(--toast-inset)))",
      '[data-ending-style][data-swipe-direction="left"]':
        "translateX(calc(var(--toast-swipe-movement-x) - 100% - var(--toast-inset))) translateY(var(--toast-calc-offset-y))",
      '[data-ending-style][data-swipe-direction="right"]':
        "translateX(calc(var(--toast-swipe-movement-x) + 100% + var(--toast-inset))) translateY(var(--toast-calc-offset-y))",
      '[data-ending-style][data-swipe-direction="up"]':
        "translateY(calc(var(--toast-swipe-movement-y) - 100% - var(--toast-inset)))",
      "[data-expanded]":
        "translateX(var(--toast-swipe-movement-x)) translateY(var(--toast-calc-offset-y))",
      "[data-starting-style]": "translateY(calc(100% + var(--toast-inset)))",
      default:
        "translateX(var(--toast-swipe-movement-x)) translateY(calc(var(--toast-swipe-movement-y) - (var(--toast-index) * var(--toast-peek)) - (var(--toast-shrink) * var(--toast-calc-height)))) scale(var(--toast-scale))",
    },
    transformOrigin: "50% calc(50% + 50% * min(var(--toast-index, 0), 1))",
    bottom: 0,
    top: "auto",
    "::after": {
      bottom: "100%",
    },
  },
  rootLeft: {
    left: 0,
    right: "auto",
  },
  rootRight: {
    left: "auto",
    right: 0,
  },
  rootCenter: {
    insetInline: 0,
  },
  replaySuccess: {
    animationDuration: "0.32s",
    animationName: successPulse,
    animationTimingFunction: "cubic-bezier(0.5, 1, 0.89, 1)",
  },
  replayError: {
    animationDuration: "0.28s",
    animationName: errorShake,
    animationTimingFunction: "cubic-bezier(0.5, 1, 0.89, 1)",
  },
  content: {
    gap: "0.375rem",
    overflow: "hidden",
    paddingBlock: "0.75rem",
    paddingInline: "0.875rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.875rem",
    justifyContent: "space-between",
    lineHeight: "1.25rem",
    opacity: {
      "[data-behind]": 0,
      "[data-expanded]": 1,
      default: null,
    },
    pointerEvents: "auto",
    transitionDuration: "250ms",
    transitionProperty: "opacity",
  },
  body: {
    gap: "0.5rem",
    display: "flex",
  },
  text: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontWeight: 500,
  },
  description: {
    color: colors.mutedForeground,
  },
  icon: {
    height: "1lh",
    width: "1rem",
  },
  iconError: { color: colors.destructive },
  iconInfo: { color: colors.info },
  iconSuccess: { color: colors.success },
  iconWarning: { color: colors.warning },
  iconLoading: {
    animationDuration: "1s",
    animationIterationCount: "infinite",
    animationName: spin,
    animationTimingFunction: "linear",
    opacity: 0.8,
  },
  anchoredViewport: {
    outlineStyle: "none",
  },
  anchoredRoot: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.popover,
    boxShadow: shadows.overlay,
    color: colors.popoverForeground,
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
    transitionProperty: "scale, opacity",
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: shadows.edge,
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
  anchoredRootTooltip: {
    borderRadius: radius.md,
  },
  contentTooltip: {
    paddingBlock: "0.25rem",
    paddingInline: "0.5rem",
    pointerEvents: "auto",
  },
  positioner: {
    zIndex: 50,
    maxWidth: "min(16rem, var(--available-width))",
  },
})
const ICON_TYPE_STYLE = {
  error: styles.iconError,
  info: styles.iconInfo,
  loading: styles.iconLoading,
  success: styles.iconSuccess,
  warning: styles.iconWarning,
} as const

function getSwipeDirection(position: ToastPosition): SwipeDirection[] {
  const verticalDirection: SwipeDirection = position.startsWith("top") ? "up" : "down"

  if (position.includes("center")) {
    return [verticalDirection]
  }

  if (position.includes("left")) {
    return ["left", verticalDirection]
  }

  return ["right", verticalDirection]
}

function replayStyle(toast: { type?: string; updateKey?: number }): stylex.StyleXStyles | false {
  const k = toast.updateKey ?? 0

  if (k <= 0) {
    return false
  }

  return toast.type === "error" ? styles.replayError : styles.replaySuccess
}

function ToastIcon({
  type,
  Icon,
}: {
  type: string | undefined
  Icon: (typeof TOAST_ICONS)[keyof typeof TOAST_ICONS]
}): React.ReactElement {
  const typeStyle = type ? ICON_TYPE_STYLE[type as keyof typeof ICON_TYPE_STYLE] : undefined
  const iconProps = stylex.props(styles.icon, typeStyle)

  return (
    <div data-slot="toast-icon">
      <Icon className={iconProps.className} style={iconProps.style} />
    </div>
  )
}

function ToastBody({
  Icon,
  type,
  actionChildren,
}: {
  Icon: (typeof TOAST_ICONS)[keyof typeof TOAST_ICONS] | null
  type: string | undefined
  actionChildren?: React.ReactNode
}): React.ReactElement {
  const bodyProps = stylex.props(styles.body)
  const textProps = stylex.props(styles.text)
  const titleProps = stylex.props(styles.title)
  const descriptionProps = stylex.props(styles.description)

  return (
    <>
      <div className={bodyProps.className} style={bodyProps.style}>
        {Icon && <ToastIcon Icon={Icon} type={type} />}
        <div className={textProps.className} style={textProps.style}>
          <Toast.Title
            className={titleProps.className}
            data-slot="toast-title"
            style={titleProps.style}
          />
          <Toast.Description
            className={descriptionProps.className}
            data-slot="toast-description"
            style={descriptionProps.style}
          />
        </div>
      </div>
      {actionChildren !== undefined && (
        <Toast.Action className={buttonVariants({ size: "xs" })} data-slot="toast-action">
          {actionChildren}
        </Toast.Action>
      )}
    </>
  )
}

function Toasts({
  position,
  portalProps,
}: {
  position: ToastPosition
  portalProps?: React.ComponentProps<typeof Toast.Portal>
}): React.ReactElement {
  const { toasts } = Toast.useToastManager()
  const swipeDirection = getSwipeDirection(position)
  const isTop = position.startsWith("top")
  const isCenter = position.includes("center")
  const isLeft = position.includes("left")
  const viewportProps = stylex.props(
    styles.viewport,
    isTop ? styles.viewportTop : styles.viewportBottom,
    isCenter ? styles.viewportCenter : isLeft ? styles.viewportLeft : styles.viewportRight,
  )
  const contentProps = stylex.props(styles.content)

  return (
    <Toast.Portal data-slot="toast-portal" {...portalProps}>
      <Toast.Viewport
        className={viewportProps.className}
        data-position={position}
        data-slot="toast-viewport"
        style={viewportProps.style}
      >
        {toasts.map((toast) => {
          const Icon = toast.type ? TOAST_ICONS[toast.type as keyof typeof TOAST_ICONS] : null
          const toastData = toast.data as ToastData | undefined
          const rootProps = stylex.props(
            surface.raisedEdge,
            styles.root,
            isTop ? styles.rootTop : styles.rootBottom,
            isCenter ? styles.rootCenter : isLeft ? styles.rootLeft : styles.rootRight,
            replayStyle(toast),
          )

          return (
            <Toast.Root
              key={toast.id}
              className={rootProps.className}
              style={
                {
                  ...rootProps.style,
                  zIndex: "calc(9999 - var(--toast-index))",
                } as React.CSSProperties
              }
              {...toastData?.rootProps}
              data-position={position}
              swipeDirection={swipeDirection}
              toast={toast}
            >
              <Toast.Content className={contentProps.className} style={contentProps.style}>
                <ToastBody
                  Icon={Icon}
                  actionChildren={toast.actionProps?.children}
                  type={toast.type}
                />
              </Toast.Content>
            </Toast.Root>
          )
        })}
      </Toast.Viewport>
    </Toast.Portal>
  )
}

function AnchoredToasts({
  portalProps,
}: {
  portalProps?: React.ComponentProps<typeof Toast.Portal>
}): React.ReactElement {
  const { toasts } = Toast.useToastManager()
  const viewportProps = stylex.props(styles.anchoredViewport)
  const positionerProps2 = stylex.props(styles.positioner)

  return (
    <Toast.Portal data-slot="toast-portal-anchored" {...portalProps}>
      <Toast.Viewport
        className={viewportProps.className}
        data-slot="toast-viewport-anchored"
        style={viewportProps.style}
      >
        {toasts.map((toast) => {
          const Icon = toast.type ? TOAST_ICONS[toast.type as keyof typeof TOAST_ICONS] : null
          const toastData = toast.data as ToastData | undefined
          const tooltipStyle = toastData?.tooltipStyle ?? false
          const positionerProps = toast.positionerProps

          if (!positionerProps?.anchor) {
            return null
          }

          const rootProps = stylex.props(
            styles.anchoredRoot,
            tooltipStyle && styles.anchoredRootTooltip,
            replayStyle(toast),
          )
          const contentProps = stylex.props(tooltipStyle ? styles.contentTooltip : styles.content)

          return (
            <Toast.Positioner
              key={toast.id}
              className={positionerProps2.className}
              data-slot="toast-positioner"
              sideOffset={positionerProps.sideOffset ?? 4}
              style={positionerProps2.style}
              toast={toast}
            >
              <Toast.Root
                className={rootProps.className}
                style={rootProps.style}
                {...toastData?.rootProps}
                data-slot="toast-popup"
                toast={toast}
              >
                <Toast.Content className={contentProps.className} style={contentProps.style}>
                  {tooltipStyle ? (
                    <Toast.Title data-slot="toast-title" />
                  ) : (
                    <ToastBody
                      Icon={Icon}
                      actionChildren={toast.actionProps?.children}
                      type={toast.type}
                    />
                  )}
                </Toast.Content>
              </Toast.Root>
            </Toast.Positioner>
          )
        })}
      </Toast.Viewport>
    </Toast.Portal>
  )
}

export const toastManager: ReturnType<typeof Toast.createToastManager> = Toast.createToastManager()

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"

export interface ToastProviderProps extends Toast.Provider.Props {
  position?: ToastPosition
  portalProps?: React.ComponentProps<typeof Toast.Portal>
}

export function ToastProvider({
  children,
  position = "bottom-right",
  portalProps,
  ...props
}: ToastProviderProps): React.ReactElement {
  return (
    <Toast.Provider toastManager={toastManager} {...props}>
      {children}
      <Toasts portalProps={portalProps} position={position} />
    </Toast.Provider>
  )
}

export const anchoredToastManager: ReturnType<typeof Toast.createToastManager> =
  Toast.createToastManager()

export interface AnchoredToastProviderProps extends Toast.Provider.Props {
  portalProps?: React.ComponentProps<typeof Toast.Portal>
}

export function AnchoredToastProvider({
  children,
  portalProps,
  ...props
}: AnchoredToastProviderProps): React.ReactElement {
  return (
    <Toast.Provider toastManager={anchoredToastManager} {...props}>
      {children}
      <AnchoredToasts portalProps={portalProps} />
    </Toast.Provider>
  )
}

export { Toast as ToastPrimitive }
