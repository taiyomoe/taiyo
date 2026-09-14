"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import * as stylex from "@stylexjs/stylex"
import * as React from "react"
import { cn } from "@/lib/utils"
import type { Sx } from "../../styles/sx"
import { colors, consts, radius, shadows } from "../../styles/tokens.stylex"

export type TabsVariant = "default" | "underline"

/**
 * The Tailwind original reached tabs from the list with
 * `*:hover:data-[slot=tabs-tab]:bg-accent`. StyleX has no child selectors, so
 * the list publishes its variant and each tab styles itself.
 */
const TabsListContext = React.createContext<TabsVariant>("default")
const styles = stylex.create({
  root: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: {
      '[data-orientation="vertical"]': "row",
      default: "column",
    },
  },
  list: {
    alignItems: "center",
    color: colors.mutedForeground,
    columnGap: "0.125rem",
    display: "flex",
    flexDirection: {
      '[data-orientation="vertical"]': "column",
      default: null,
    },
    justifyContent: "center",
    position: "relative",
    zIndex: 0,
    width: "fit-content",
  },
  listDefault: {
    padding: "0.25rem",
    // `radius.full` is a pill on a horizontal bar; on a vertical column the
    // same value turns the rail into a blob that swallows the first and last
    // rows. Vertical gets a real corner, with concentric rows inside it.
    borderRadius: {
      '[data-orientation="vertical"]': radius.xl,
      default: radius.full,
    },
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    color: `color-mix(in srgb, ${colors.mutedForeground} 72%, transparent)`,
  },
  listUnderline: {
    paddingBlock: {
      '[data-orientation="horizontal"]': "0.25rem",
      default: null,
    },
    paddingInline: {
      '[data-orientation="vertical"]': "0.25rem",
      default: null,
    },
  },
  indicator: {
    position: "absolute",
    transitionDuration: "200ms",
    transitionProperty: "width, translate",
    transitionTimingFunction: "ease-in-out",
    translate: "var(--active-tab-left) calc(-1 * var(--active-tab-bottom))",
    bottom: 0,
    height: "var(--active-tab-height)",
    left: 0,
    width: "var(--active-tab-width)",
  },
  // The raised pill that rides over the sunken rail.
  indicatorDefault: {
    borderRadius: {
      '[data-orientation="vertical"]': `calc(${radius.xl} - 0.25rem)`,
      default: radius.full,
    },
    backgroundColor: colors.wellRaised,
    boxShadow: shadows.raised,
    zIndex: -1,
  },
  indicatorUnderline: {
    backgroundColor: colors.primary,
    translate: {
      '[data-orientation="horizontal"]':
        "var(--active-tab-left) calc(1px - var(--active-tab-bottom))",
      '[data-orientation="vertical"]':
        "calc(var(--active-tab-left) - 1px) calc(-1 * var(--active-tab-bottom))",
      default: "var(--active-tab-left) calc(-1 * var(--active-tab-bottom))",
    },
    zIndex: 10,
    // The defaults have to repeat `indicator`'s values: a `null` default is
    // still a declaration and it overrode them, which left the underline
    // 0px wide (horizontal) — invisible.
    height: {
      '[data-orientation="horizontal"]': "2px",
      default: "var(--active-tab-height)",
    },
    width: {
      '[data-orientation="vertical"]': "2px",
      default: "var(--active-tab-width)",
    },
  },
  tab: {
    borderColor: "transparent",
    borderRadius: {
      '[data-orientation="vertical"]': `calc(${radius.xl} - 0.25rem)`,
      default: radius.full,
    },
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.375rem",
    paddingInline: "calc(0.75rem - 1px)",
    alignItems: "center",
    color: {
      "[data-active]": colors.foreground,
      default: null,
      ":hover": colors.mutedForeground,
    },
    cursor: "pointer",
    display: "flex",
    flexGrow: 1,
    flexShrink: 0,
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    fontWeight: 500,
    justifyContent: {
      '[data-orientation="vertical"]': "flex-start",
      default: "center",
    },
    opacity: {
      "[data-disabled]": 0.64,
      default: null,
    },
    outlineColor: colors.ring,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 2,
    pointerEvents: {
      "[data-disabled]": "none",
      default: null,
    },
    position: "relative",
    transitionProperty: "color, background-color, box-shadow",
    whiteSpace: "nowrap",
    height: {
      default: "2.25rem",
      [consts.sm]: "2rem",
    },
    width: {
      '[data-orientation="vertical"]': "100%",
      default: null,
    },
  },
  tabUnderline: {
    backgroundColor: {
      default: null,
      ":hover": colors.accent,
    },
  },
  panel: {
    flex: "1",
    outlineStyle: "none",
  },
})

export function Tabs({
  className,
  sx,
  ...props
}: TabsPrimitive.Root.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.root, sx)

  return (
    <TabsPrimitive.Root
      className={cn(styleProps.className, className)}
      data-slot="tabs"
      style={styleProps.style}
      {...props}
    />
  )
}

export function TabsList({
  variant = "default",
  className,
  children,
  sx,
  ...props
}: TabsPrimitive.List.Props & {
  variant?: TabsVariant
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(
    styles.list,
    variant === "default" ? styles.listDefault : styles.listUnderline,
    sx,
  )
  const indicatorProps = stylex.props(
    styles.indicator,
    variant === "underline" ? styles.indicatorUnderline : styles.indicatorDefault,
  )

  return (
    <TabsListContext value={variant}>
      <TabsPrimitive.List
        className={cn(styleProps.className, className)}
        data-slot="tabs-list"
        style={styleProps.style}
        {...props}
      >
        {children}
        <TabsPrimitive.Indicator
          className={indicatorProps.className}
          data-slot="tab-indicator"
          style={indicatorProps.style}
        />
      </TabsPrimitive.List>
    </TabsListContext>
  )
}

export function TabsTab({
  className,
  sx,
  ...props
}: TabsPrimitive.Tab.Props & { sx?: Sx }): React.ReactElement {
  const variant = React.useContext(TabsListContext)
  const styleProps = stylex.props(styles.tab, variant === "underline" && styles.tabUnderline, sx)

  return (
    <TabsPrimitive.Tab
      className={cn(styleProps.className, className)}
      data-slot="tabs-tab"
      style={styleProps.style}
      {...props}
    />
  )
}

export function TabsPanel({
  className,
  sx,
  ...props
}: TabsPrimitive.Panel.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.panel, sx)

  return (
    <TabsPrimitive.Panel
      className={cn(styleProps.className, className)}
      data-slot="tabs-content"
      style={styleProps.style}
      {...props}
    />
  )
}

export { TabsPrimitive, TabsTab as TabsTrigger, TabsPanel as TabsContent }
