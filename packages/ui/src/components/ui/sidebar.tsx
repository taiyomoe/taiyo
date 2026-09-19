"use client"

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetDescription, SheetHeader, SheetPopup, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/utils/cn"
import { PanelLeft } from "@/components/icons"
import type { Sx } from "../../styles/sx"
import { colors, consts, radius, shadows } from "../../styles/tokens.stylex"

const SIDEBAR_COOKIE_NAME: string = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE: number = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH: string = "16rem"
const SIDEBAR_WIDTH_MOBILE: string = "18rem"
const SIDEBAR_WIDTH_ICON: string = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT: string = "b"
/** Below this the sidebar becomes a sheet rather than a rail. */
const MOBILE_QUERY: string = "(max-width: 799px)"

export type SidebarSide = "left" | "right"

export type SidebarVariant = "sidebar" | "floating" | "inset"

export type SidebarCollapsible = "offcanvas" | "icon" | "none"

export type SidebarMenuButtonSize = "default" | "sm" | "lg"

export type SidebarMenuButtonVariant = "default" | "outline"

/**
 * StyleX has no ancestor or sibling selector that reaches every descendant of
 * the sidebar root, so `Sidebar` publishes its layout props through context
 * and each part decides for itself how to render.
 */
const SidebarLayoutContext = React.createContext<{
  collapsible: SidebarCollapsible
  side: SidebarSide
  variant: SidebarVariant
}>({
  collapsible: "offcanvas",
  side: "left",
  variant: "sidebar",
})

function useIconCollapsed(): boolean {
  const { collapsible } = React.useContext(SidebarLayoutContext)
  const context = React.useContext(SidebarContext)

  return collapsible === "icon" && context?.state === "collapsed"
}

const styles = stylex.create({
  wrapper: {
    display: "flex",
    minHeight: "100svh",
    width: "100%",
  },
  staticSidebar: {
    backgroundColor: colors.sidebar,
    color: colors.sidebarForeground,
    display: "flex",
    flexDirection: "column",
    height: "100svh",
    width: "var(--sidebar-width)",
  },
  mobileSheet: {
    padding: 0,
    backgroundColor: colors.sidebar,
    color: colors.sidebarForeground,
    width: "var(--sidebar-width)",
  },
  mobileInner: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
  },
  srOnly: {
    margin: -1,
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    clipPath: "inset(50%)",
    position: "absolute",
    whiteSpace: "nowrap",
    height: "1px",
    width: "1px",
  },
  root: {
    color: colors.sidebarForeground,
    display: {
      default: "none",
      "@media (width >= 48rem)": "block",
    },
  },
  // The gap element reserves the sidebar's track in the page flow.
  gap: {
    backgroundColor: "transparent",
    position: "relative",
    transitionDuration: "200ms",
    transitionProperty: "width",
    transitionTimingFunction: "linear",
    width: "var(--sidebar-width)",
  },
  gapRight: {
    rotate: "180deg",
  },
  gapOffcanvas: {
    width: 0,
  },
  gapIcon: {
    width: "var(--sidebar-width-icon)",
  },
  gapIconFloating: {
    width: "calc(var(--sidebar-width-icon) + 1rem)",
  },
  container: {
    insetBlock: 0,
    display: {
      default: "none",
      "@media (width >= 48rem)": "flex",
    },
    position: "fixed",
    transitionDuration: "200ms",
    transitionProperty: "left, right, width",
    transitionTimingFunction: "linear",
    zIndex: 10,
    height: "100svh",
    width: "var(--sidebar-width)",
  },
  containerLeft: { left: 0 },
  containerRight: { right: 0 },
  containerLeftOffcanvas: { left: "calc(-1 * var(--sidebar-width))" },
  containerRightOffcanvas: { right: "calc(-1 * var(--sidebar-width))" },
  containerFloating: {
    padding: "0.5rem",
  },
  containerFloatingIcon: {
    width: "calc(var(--sidebar-width-icon) + 1rem + 2px)",
  },
  containerIcon: {
    width: "var(--sidebar-width-icon)",
  },
  containerBorderLeft: {
    borderLeftColor: colors.sidebarBorder,
    borderLeftStyle: "solid",
    borderLeftWidth: 1,
  },
  containerBorderRight: {
    borderRightColor: colors.sidebarBorder,
    borderRightStyle: "solid",
    borderRightWidth: 1,
  },
  inner: {
    backgroundColor: colors.sidebar,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
  },
  innerFloating: {
    borderColor: colors.sidebarBorder,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    boxShadow: shadows.raised,
  },
  trigger: {
    height: "1.75rem",
    width: "1.75rem",
  },
  rail: {
    insetBlock: 0,
    display: {
      default: "none",
      [consts.sm]: "flex",
    },
    position: "absolute",
    transitionProperty: "all",
    transitionTimingFunction: "linear",
    translate: "-50%",
    zIndex: 20,
    width: "1rem",
    "::after": {
      insetBlock: 0,
      backgroundColor: {
        default: null,
        ":hover": colors.sidebarBorder,
      },
      content: '""',
      position: "absolute",
      left: "50%",
      width: "2px",
    },
  },
  railLeft: {
    cursor: "w-resize",
    right: "-1rem",
  },
  railRight: {
    cursor: "e-resize",
    left: 0,
  },
  railLeftCollapsed: { cursor: "e-resize" },
  railRightCollapsed: { cursor: "w-resize" },
  railOffcanvas: {
    backgroundColor: {
      default: null,
      ":hover": colors.sidebar,
    },
    translate: 0,
    "::after": {
      left: "100%",
    },
  },
  railLeftOffcanvas: { right: "-0.5rem" },
  railRightOffcanvas: { left: "-0.5rem" },
  inset: {
    flex: "1",
    backgroundColor: colors.background,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    width: "100%",
  },
  insetFloating: {
    margin: {
      default: null,
      "@media (width >= 48rem)": "0.5rem",
    },
    borderRadius: {
      default: null,
      "@media (width >= 48rem)": radius.xl,
    },
    boxShadow: {
      default: null,
      "@media (width >= 48rem)": shadows.raised,
    },
    marginLeft: {
      default: null,
      "@media (width >= 48rem)": 0,
    },
  },
  insetFloatingCollapsed: {
    marginLeft: {
      default: null,
      "@media (width >= 48rem)": "0.5rem",
    },
  },
  stack: {
    padding: "0.5rem",
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  separator: {
    backgroundColor: colors.sidebarBorder,
    width: "auto",
  },
  content: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  contentIcon: {
    overflow: "hidden",
  },
  scrollArea: {
    flex: "1",
    minHeight: 0,
  },
  group: {
    padding: "0.5rem",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    minWidth: 0,
    width: "100%",
  },
  groupLabel: {
    borderRadius: radius.lg,
    paddingInline: "0.5rem",
    alignItems: "center",
    color: colors.sidebarForeground,
    display: "flex",
    flexShrink: 0,
    fontSize: "0.75rem",
    fontWeight: 500,
    lineHeight: "1rem",
    outlineColor: colors.sidebarRing,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
    transitionDuration: "200ms",
    transitionProperty: "margin, opacity",
    transitionTimingFunction: "linear",
    height: "2rem",
  },
  groupLabelIcon: {
    opacity: 0,
    marginTop: "-2rem",
  },
  hidden: {
    display: "none",
  },
  groupContent: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    width: "100%",
  },
  menu: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    width: "100%",
  },
  menuItem: {
    position: "relative",
  },
  menuButton: {
    padding: "0.5rem",
    borderRadius: radius.lg,
    gap: "0.5rem",
    overflow: "hidden",
    alignItems: "center",
    backgroundColor: {
      '[data-active="true"]': colors.sidebarAccent,
      '[data-state="open"]': colors.sidebarAccent,
      default: null,
      ":hover": colors.sidebarAccent,
      ":active": colors.sidebarAccent,
    },
    color: {
      '[data-active="true"]': colors.sidebarAccentForeground,
      default: null,
      ":hover": colors.sidebarAccentForeground,
      ":active": colors.sidebarAccentForeground,
    },
    display: "flex",
    fontWeight: {
      '[data-active="true"]': 500,
      default: null,
    },
    opacity: {
      '[aria-disabled="true"]': 0.5,
      default: null,
      ":disabled": 0.5,
    },
    outlineColor: colors.sidebarRing,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
    pointerEvents: {
      '[aria-disabled="true"]': "none",
      default: null,
      ":disabled": "none",
    },
    textAlign: "left",
    transitionProperty: "width, height, padding",
    width: "100%",
  },
  menuButtonOutline: {
    backgroundColor: {
      default: colors.background,
      ":hover": colors.sidebarAccent,
    },
    boxShadow: {
      default: `0 0 0 1px ${colors.sidebarBorder}`,
      ":hover": `0 0 0 1px ${colors.sidebarAccent}`,
    },
  },
  menuButtonDefaultSize: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    height: "2rem",
  },
  menuButtonSm: {
    fontSize: "0.75rem",
    lineHeight: "1rem",
    height: "1.75rem",
  },
  menuButtonLg: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    height: "3rem",
  },
  menuButtonIcon: {
    padding: "0.5rem",
    height: "2rem",
    width: "2rem",
  },
  menuButtonIconLg: {
    padding: 0,
  },
  menuBadge: {
    borderRadius: radius.lg,
    paddingInline: "0.25rem",
    alignItems: "center",
    color: colors.sidebarForeground,
    display: "flex",
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 500,
    justifyContent: "center",
    lineHeight: "1rem",
    pointerEvents: "none",
    position: "absolute",
    userSelect: "none",
    height: "1.25rem",
    minWidth: "1.25rem",
    right: "0.25rem",
  },
  menuSkeleton: {
    borderRadius: radius.lg,
    gap: "0.5rem",
    paddingInline: "0.5rem",
    alignItems: "center",
    display: "flex",
    height: "2rem",
  },
  menuSkeletonIcon: {
    borderRadius: radius.lg,
    height: "1rem",
    width: "1rem",
  },
  menuSkeletonText: {
    flex: "1",
    height: "1rem",
    maxWidth: "var(--skeleton-width)",
  },
  menuSub: {
    gap: "0.25rem",
    marginInline: "0.875rem",
    paddingBlock: "0.125rem",
    paddingInline: "0.625rem",
    display: "flex",
    flexDirection: "column",
    translate: "1px",
    borderLeftColor: colors.sidebarBorder,
    borderLeftStyle: "solid",
    borderLeftWidth: 1,
    minWidth: 0,
  },
  menuSubItem: {
    position: "relative",
  },
  menuSubButton: {
    borderRadius: radius.lg,
    gap: "0.5rem",
    overflow: "hidden",
    paddingInline: "0.5rem",
    alignItems: "center",
    backgroundColor: {
      '[data-active="true"]': colors.sidebarAccent,
      default: null,
      ":hover": colors.sidebarAccent,
      ":active": colors.sidebarAccent,
    },
    color: {
      '[data-active="true"]': colors.sidebarAccentForeground,
      default: colors.sidebarForeground,
      ":hover": colors.sidebarAccentForeground,
      ":active": colors.sidebarAccentForeground,
    },
    display: "flex",
    opacity: {
      '[aria-disabled="true"]': 0.5,
      default: null,
      ":disabled": 0.5,
    },
    outlineColor: colors.sidebarRing,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
    pointerEvents: {
      '[aria-disabled="true"]': "none",
      default: null,
      ":disabled": "none",
    },
    translate: "-1px",
    height: {
      default: "2rem",
      [consts.sm]: "1.75rem",
    },
    minWidth: 0,
  },
  menuSubButtonSm: {
    fontSize: "0.75rem",
    lineHeight: "1rem",
  },
  menuSubButtonMd: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
})
const MENU_BUTTON_SIZE_STYLE = {
  default: styles.menuButtonDefaultSize,
  lg: styles.menuButtonLg,
  sm: styles.menuButtonSm,
} as const

export type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

export const SidebarContext: React.Context<SidebarContextProps | null> =
  React.createContext<SidebarContextProps | null>(null)

export function useSidebar(): SidebarContextProps {
  const context = React.useContext(SidebarContext)

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  sx,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  sx?: Sx
}): React.ReactElement {
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const [openMobile, setOpenMobile] = React.useState(false)
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    async (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value

      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      await cookieStore.set({
        expires: Date.now() + SIDEBAR_COOKIE_MAX_AGE * 1000,
        name: SIDEBAR_COOKIE_NAME,
        path: "/",
        value: String(openState),
      })
    },
    [setOpenProp, open],
  )
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        void toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  const state = open ? "expanded" : "collapsed"
  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      isMobile,
      open,
      openMobile,
      setOpen,
      setOpenMobile,
      state,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar],
  )
  const styleProps = stylex.props(styles.wrapper, sx)

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        className={cn(styleProps.className, className)}
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...styleProps.style,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  sx,
  ...props
}: React.ComponentProps<"div"> & {
  side?: SidebarSide
  variant?: SidebarVariant
  collapsible?: SidebarCollapsible
  sx?: Sx
}): React.ReactElement {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()
  const layoutValue = React.useMemo(
    () => ({ collapsible, side, variant }),
    [collapsible, side, variant],
  )
  const collapsed = state === "collapsed"
  const isOffcanvas = collapsed && collapsible === "offcanvas"
  const isIcon = collapsed && collapsible === "icon"
  const floats = variant === "floating" || variant === "inset"
  const staticProps = stylex.props(styles.staticSidebar, sx)
  const rootProps = stylex.props(styles.root)
  const gapProps = stylex.props(
    styles.gap,
    side === "right" && styles.gapRight,
    isIcon && (floats ? styles.gapIconFloating : styles.gapIcon),
    isOffcanvas && styles.gapOffcanvas,
  )
  const containerProps = stylex.props(
    styles.container,
    side === "left" ? styles.containerLeft : styles.containerRight,
    isOffcanvas &&
      (side === "left" ? styles.containerLeftOffcanvas : styles.containerRightOffcanvas),
    floats && styles.containerFloating,
    floats && isIcon && styles.containerFloatingIcon,
    !floats && isIcon && styles.containerIcon,
    !floats && (side === "left" ? styles.containerBorderRight : styles.containerBorderLeft),
    sx,
  )
  const innerProps = stylex.props(styles.inner, variant === "floating" && styles.innerFloating)
  const mobileInnerProps = stylex.props(styles.mobileInner)
  const srOnlyProps = stylex.props(styles.srOnly)

  if (collapsible === "none") {
    return (
      <SidebarLayoutContext value={layoutValue}>
        <div
          className={cn(staticProps.className, className)}
          data-slot="sidebar"
          style={staticProps.style}
          {...props}
        >
          {children}
        </div>
      </SidebarLayoutContext>
    )
  }

  if (isMobile) {
    return (
      <SidebarLayoutContext value={layoutValue}>
        <Sheet onOpenChange={setOpenMobile} open={openMobile} {...props}>
          <SheetPopup
            data-mobile="true"
            data-sidebar="sidebar"
            data-slot="sidebar"
            side={side}
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            sx={styles.mobileSheet}
          >
            <SheetHeader sx={styles.srOnly}>
              <SheetTitle>Sidebar</SheetTitle>
              <SheetDescription>Displays the mobile sidebar.</SheetDescription>
            </SheetHeader>
            <div className={mobileInnerProps.className} style={mobileInnerProps.style}>
              {children}
            </div>
          </SheetPopup>
        </Sheet>
      </SidebarLayoutContext>
    )
  }

  return (
    <SidebarLayoutContext value={layoutValue}>
      <div
        className={rootProps.className}
        data-collapsible={collapsed ? collapsible : ""}
        data-side={side}
        data-slot="sidebar"
        data-state={state}
        data-variant={variant}
        style={rootProps.style}
      >
        {/* Reserves the sidebar's track in the page flow. */}
        <div className={gapProps.className} data-slot="sidebar-gap" style={gapProps.style} />
        <div
          className={cn(containerProps.className, className)}
          data-slot="sidebar-container"
          style={containerProps.style}
          {...props}
        >
          <div
            className={innerProps.className}
            data-sidebar="sidebar"
            data-slot="sidebar-inner"
            style={innerProps.style}
          >
            {children}
          </div>
        </div>
      </div>
      <span className={srOnlyProps.className} style={srOnlyProps.style} />
    </SidebarLayoutContext>
  )
}

export function SidebarTrigger({
  className,
  onClick,
  sx,
  ...props
}: React.ComponentProps<typeof Button> & { sx?: Sx }): React.ReactElement {
  const { toggleSidebar } = useSidebar()
  const srOnlyProps = stylex.props(styles.srOnly)

  return (
    <Button
      className={className}
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        toggleSidebar()
      }}
      size="icon"
      sx={[styles.trigger, sx]}
      variant="ghost"
      {...props}
    >
      <PanelLeft />
      <span className={srOnlyProps.className} style={srOnlyProps.style}>
        Toggle Sidebar
      </span>
    </Button>
  )
}

export function SidebarRail({
  className,
  sx,
  ...props
}: React.ComponentProps<"button"> & { sx?: Sx }): React.ReactElement {
  const { toggleSidebar, state } = useSidebar()
  const { collapsible, side } = React.useContext(SidebarLayoutContext)
  const collapsed = state === "collapsed"
  const isOffcanvas = collapsed && collapsible === "offcanvas"
  const styleProps = stylex.props(
    styles.rail,
    side === "left" ? styles.railLeft : styles.railRight,
    collapsed && (side === "left" ? styles.railLeftCollapsed : styles.railRightCollapsed),
    isOffcanvas && styles.railOffcanvas,
    isOffcanvas && (side === "left" ? styles.railLeftOffcanvas : styles.railRightOffcanvas),
    sx,
  )

  return (
    <button
      aria-label="Toggle Sidebar"
      className={cn(styleProps.className, className)}
      data-sidebar="rail"
      data-slot="sidebar-rail"
      onClick={toggleSidebar}
      style={styleProps.style}
      tabIndex={-1}
      title="Toggle Sidebar"
      type="button"
      {...props}
    />
  )
}

export function SidebarInset({
  className,
  sx,
  ...props
}: React.ComponentProps<"main"> & { sx?: Sx }): React.ReactElement {
  const { variant } = React.useContext(SidebarLayoutContext)
  const context = React.useContext(SidebarContext)
  const isInset = variant === "inset"
  const styleProps = stylex.props(
    styles.inset,
    isInset && styles.insetFloating,
    isInset && context?.state === "collapsed" && styles.insetFloatingCollapsed,
    sx,
  )

  return (
    <main
      className={cn(styleProps.className, className)}
      data-slot="sidebar-inset"
      style={styleProps.style}
      {...props}
    />
  )
}

export function SidebarHeader({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.stack, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-sidebar="header"
      data-slot="sidebar-header"
      style={styleProps.style}
      {...props}
    />
  )
}

export function SidebarFooter({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.stack, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-sidebar="footer"
      data-slot="sidebar-footer"
      style={styleProps.style}
      {...props}
    />
  )
}

export function SidebarSeparator({
  className,
  sx,
  ...props
}: React.ComponentProps<typeof Separator> & { sx?: Sx }): React.ReactElement {
  return (
    <Separator
      className={className}
      data-sidebar="separator"
      data-slot="sidebar-separator"
      sx={[styles.separator, sx]}
      {...props}
    />
  )
}

export function SidebarContent({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const iconCollapsed = useIconCollapsed()
  const styleProps = stylex.props(styles.content, iconCollapsed && styles.contentIcon, sx)

  return (
    <ScrollArea fill scrollFade sx={styles.scrollArea}>
      <div
        className={cn(styleProps.className, className)}
        data-sidebar="content"
        data-slot="sidebar-content"
        style={styleProps.style}
        {...props}
      />
    </ScrollArea>
  )
}

export function SidebarGroup({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.group, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-sidebar="group"
      data-slot="sidebar-group"
      style={styleProps.style}
      {...props}
    />
  )
}

export function SidebarGroupLabel({
  className,
  render,
  sx,
  ...props
}: useRender.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const iconCollapsed = useIconCollapsed()
  const styleProps = stylex.props(styles.groupLabel, iconCollapsed && styles.groupLabelIcon, sx)
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-sidebar": "group-label",
    "data-slot": "sidebar-group-label",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps(defaultProps, props),
    render,
  })
}

export function SidebarGroupContent({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.groupContent, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-sidebar="group-content"
      data-slot="sidebar-group-content"
      style={styleProps.style}
      {...props}
    />
  )
}

export function SidebarMenu({
  className,
  sx,
  ...props
}: React.ComponentProps<"ul"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.menu, sx)

  return (
    <ul
      className={cn(styleProps.className, className)}
      data-sidebar="menu"
      data-slot="sidebar-menu"
      style={styleProps.style}
      {...props}
    />
  )
}

export function SidebarMenuItem({
  className,
  sx,
  ...props
}: React.ComponentProps<"li"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.menuItem, sx)

  return (
    <li
      className={cn(styleProps.className, className)}
      data-sidebar="menu-item"
      data-slot="sidebar-menu-item"
      style={styleProps.style}
      {...props}
    />
  )
}

export function SidebarMenuButton({
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  render,
  sx,
  ...props
}: useRender.ComponentProps<"button"> & {
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipPopup>
  size?: SidebarMenuButtonSize
  variant?: SidebarMenuButtonVariant
  sx?: Sx
}): React.ReactElement {
  const { isMobile, state } = useSidebar()
  const iconCollapsed = useIconCollapsed()
  const styleProps = stylex.props(
    styles.menuButton,
    MENU_BUTTON_SIZE_STYLE[size],
    variant === "outline" && styles.menuButtonOutline,
    iconCollapsed && styles.menuButtonIcon,
    iconCollapsed && size === "lg" && styles.menuButtonIconLg,
    sx,
  )
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-active": isActive,
    "data-sidebar": "menu-button",
    "data-size": size,
    "data-slot": "sidebar-menu-button",
    style: styleProps.style,
  }
  const buttonProps = mergeProps<"button">(defaultProps, props)
  const buttonElement = useRender({
    defaultTagName: "button",
    props: buttonProps,
    render,
  })

  if (!tooltip) {
    return buttonElement
  }

  const tooltipProps = typeof tooltip === "string" ? { children: tooltip } : tooltip

  return (
    <Tooltip>
      <TooltipTrigger render={buttonElement as React.ReactElement<Record<string, unknown>>} />
      <TooltipPopup
        align="center"
        hidden={state !== "collapsed" || isMobile}
        side="right"
        {...tooltipProps}
      />
    </Tooltip>
  )
}

export function SidebarMenuBadge({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const iconCollapsed = useIconCollapsed()
  const styleProps = stylex.props(styles.menuBadge, iconCollapsed && styles.hidden, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-sidebar="menu-badge"
      data-slot="sidebar-menu-badge"
      style={styleProps.style}
      {...props}
    />
  )
}

export function SidebarMenuSkeleton({
  className,
  showIcon = false,
  sx,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
  sx?: Sx
}): React.ReactElement {
  // Width between 50 and 90%, derived deterministically from this instance's id.
  // Math.random() during render is impure -- the React Compiler may recompute it,
  // and it produces a server/client hydration mismatch.
  const id = React.useId()
  const width = React.useMemo(() => {
    let hash = 0

    for (const char of id) {
      hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0
    }

    return `${(Math.abs(hash) % 41) + 50}%`
  }, [id])
  const styleProps = stylex.props(styles.menuSkeleton, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-sidebar="menu-skeleton"
      data-slot="sidebar-menu-skeleton"
      style={styleProps.style}
      {...props}
    >
      {showIcon && <Skeleton data-sidebar="menu-skeleton-icon" sx={styles.menuSkeletonIcon} />}
      <Skeleton
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
        sx={styles.menuSkeletonText}
      />
    </div>
  )
}

export function SidebarMenuSub({
  className,
  sx,
  ...props
}: React.ComponentProps<"ul"> & { sx?: Sx }): React.ReactElement {
  const iconCollapsed = useIconCollapsed()
  const styleProps = stylex.props(styles.menuSub, iconCollapsed && styles.hidden, sx)

  return (
    <ul
      className={cn(styleProps.className, className)}
      data-sidebar="menu-sub"
      data-slot="sidebar-menu-sub"
      style={styleProps.style}
      {...props}
    />
  )
}

export function SidebarMenuSubItem({
  className,
  sx,
  ...props
}: React.ComponentProps<"li"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.menuSubItem, sx)

  return (
    <li
      className={cn(styleProps.className, className)}
      data-sidebar="menu-sub-item"
      data-slot="sidebar-menu-sub-item"
      style={styleProps.style}
      {...props}
    />
  )
}

export function SidebarMenuSubButton({
  size = "md",
  isActive = false,
  className,
  render,
  sx,
  ...props
}: useRender.ComponentProps<"a"> & {
  size?: "sm" | "md"
  isActive?: boolean
  sx?: Sx
}): React.ReactElement {
  const iconCollapsed = useIconCollapsed()
  const styleProps = stylex.props(
    styles.menuSubButton,
    size === "sm" ? styles.menuSubButtonSm : styles.menuSubButtonMd,
    iconCollapsed && styles.hidden,
    sx,
  )
  const defaultProps = {
    className: cn(styleProps.className, className),
    "data-active": isActive,
    "data-sidebar": "menu-sub-button",
    "data-size": size,
    "data-slot": "sidebar-menu-sub-button",
    style: styleProps.style,
  }

  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(defaultProps, props),
    render,
  })
}
