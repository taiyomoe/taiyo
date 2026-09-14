"use client"

import type { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import * as stylex from "@stylexjs/stylex"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import {
  Toggle as ToggleComponent,
  type ToggleSize,
  type ToggleVariant,
} from "@/components/ui/toggle"
import { colors, radius, shadows } from "../../styles/tokens.stylex"
import type { Sx } from "../../styles/sx"

const rootStyles = stylex.create({
  base: {
    display: "flex",
    width: "fit-content",
  },
  gapped: {
    gap: "0.125rem",
  },
  vertical: {
    flexDirection: "column",
  },
})
/**
 * Styles the group hands to its items through context (StyleX cannot style
 * arbitrary children from the parent). First/last detection uses the allowed
 * `:first-child`/`:last-child` conditions, so separators count as siblings —
 * exactly like the old `*:not-first:` Tailwind rules.
 *
 * Dropped from the Tailwind source (needed `:has()` + theme knowledge, both
 * unavailable): the dark-only rules brightening a separator when its
 * neighbouring toggle is hovered or pressed.
 */
const itemStyles = stylex.create({
  common: {
    zIndex: {
      default: null,
      ":focus-visible": 10,
    },
  },
  collapseTapHeight: {
    "::after": {
      minHeight: "auto",
    },
  },
  collapseTapWidth: {
    "::after": {
      minWidth: "auto",
    },
  },
  joinedHorizontal: {
    borderBottomLeftRadius: {
      default: 0,
      ":first-child": radius.lg,
    },
    borderBottomRightRadius: {
      default: 0,
      ":last-child": radius.lg,
    },
    borderLeftWidth: {
      default: 0,
      ":first-child": 1,
    },
    borderRightWidth: {
      default: 0,
      ":last-child": 1,
    },
    borderTopLeftRadius: {
      default: 0,
      ":first-child": radius.lg,
    },
    borderTopRightRadius: {
      default: 0,
      ":last-child": radius.lg,
    },
    // The ::before edge stretches 0.5px over each shared seam.
    "::before": {
      inset: {
        default: "0 -0.5px",
        ":first-child": "0 -0.5px 0 0",
        ":last-child": "0 0 0 -0.5px",
        ":only-child": 0,
      },
    },
  },
  joinedVertical: {
    borderBottomLeftRadius: {
      default: 0,
      ":last-child": radius.lg,
    },
    borderBottomRightRadius: {
      default: 0,
      ":last-child": radius.lg,
    },
    borderBottomWidth: {
      default: 0,
      ":last-child": 1,
    },
    borderTopLeftRadius: {
      default: 0,
      ":first-child": radius.lg,
    },
    borderTopRightRadius: {
      default: 0,
      ":first-child": radius.lg,
    },
    borderTopWidth: {
      default: 0,
      ":first-child": 1,
    },
    // The Tailwind source showed the edge only on the last item in light and
    // only on the first in dark. Components cannot know the theme, so both
    // ends keep the edge (the token flips direction per theme); middle items
    // drop it, as before.
    "::before": {
      inset: {
        default: "-0.5px 0",
        ":first-child": "0 0 -0.5px 0",
        ":last-child": "-0.5px 0 0 0",
        ":only-child": 0,
      },
      boxShadow: {
        default: "none",
        ":first-child": shadows.edge,
        ":last-child": shadows.edge,
      },
    },
  },
})
const separatorStyles = stylex.create({
  base: {
    backgroundColor: colors.input,
    pointerEvents: "none",
    position: "relative",
  },
})

export interface ToggleGroupContextValue {
  size?: ToggleSize | null
  variant?: ToggleVariant | null
  orientation?: "horizontal" | "vertical"
}

export const ToggleGroupContext: React.Context<ToggleGroupContextValue> =
  React.createContext<ToggleGroupContextValue>({
    orientation: "horizontal",
    size: "default",
    variant: "default",
  })

export interface ToggleGroupProps extends ToggleGroupPrimitive.Props {
  variant?: ToggleVariant
  size?: ToggleSize
  sx?: Sx
}

export function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  orientation = "horizontal",
  children,
  sx,
  ...props
}: ToggleGroupProps): React.ReactElement {
  const contextValue = React.useMemo<ToggleGroupContextValue>(
    () => ({ orientation, size, variant }),
    [orientation, size, variant],
  )
  const styleProps = stylex.props(
    rootStyles.base,
    orientation === "vertical" && rootStyles.vertical,
    variant === "default" && rootStyles.gapped,
    sx,
  )

  return (
    <ToggleGroupPrimitive
      className={cn(styleProps.className, className)}
      data-size={size}
      data-slot="toggle-group"
      data-variant={variant}
      orientation={orientation}
      style={styleProps.style}
      {...props}
    >
      <ToggleGroupContext.Provider value={contextValue}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  )
}

export interface ToggleGroupItemProps extends TogglePrimitive.Props {
  variant?: ToggleVariant
  size?: ToggleSize
  sx?: Sx
}

export function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  sx,
  ...props
}: ToggleGroupItemProps): React.ReactElement {
  const context = React.useContext(ToggleGroupContext)
  const resolvedVariant: ToggleVariant = context.variant || variant || "default"
  const resolvedSize: ToggleSize = context.size || size || "default"
  const orientation = context.orientation ?? "horizontal"
  const joined: boolean = resolvedVariant === "outline"

  return (
    <ToggleComponent
      className={className}
      data-size={resolvedSize}
      data-variant={resolvedVariant}
      size={resolvedSize}
      sx={[
        itemStyles.common,
        orientation === "horizontal" ? itemStyles.collapseTapWidth : itemStyles.collapseTapHeight,
        joined &&
          (orientation === "horizontal" ? itemStyles.joinedHorizontal : itemStyles.joinedVertical),
        sx,
      ]}
      variant={resolvedVariant}
      {...props}
    >
      {children}
    </ToggleComponent>
  )
}

/**
 * The old dark-only `before:bg-input/32` tint layer is dropped: the `input`
 * token already themes itself, and the extra layer only existed so the
 * (also dropped) neighbour-hover rules could recolour it.
 */
export function ToggleGroupSeparator({
  className,
  orientation = "vertical",
  sx,
  ...props
}: {
  className?: string
} & React.ComponentProps<typeof Separator>): React.ReactElement {
  return (
    <Separator
      className={className}
      orientation={orientation}
      sx={[separatorStyles.base, sx]}
      {...props}
    />
  )
}

export { ToggleGroupPrimitive }
