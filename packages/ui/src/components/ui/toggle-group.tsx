import type { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import * as stylex from "@stylexjs/stylex"
import * as React from "react"
import { cn } from "../../utils/cn"
import { Separator } from "./separator"
import { Toggle as ToggleComponent, type ToggleSize, type ToggleVariant } from "./toggle"
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

export type ToggleGroupContextValue = {
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

export type ToggleGroupProps = ToggleGroupPrimitive.Props & {
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

export type ToggleGroupItemProps = TogglePrimitive.Props & {
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
  const resolvedVariant: ToggleVariant = context.variant ?? variant ?? "default"
  const resolvedSize: ToggleSize = context.size ?? size ?? "default"
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
