"use client"

import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/utils/cn"
import { ChevronsUpDown, Close } from "@/components/icons"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Sx } from "../../styles/sx"
import { colors, consts, radius, shadows } from "../../styles/tokens.stylex"

export const Autocomplete: typeof AutocompletePrimitive.Root = AutocompletePrimitive.Root

const styles = stylex.create({
  inputGroup: {
    color: colors.foreground,
    position: "relative",
    width: "100%",
  },
  startAddon: {
    insetBlock: 0,
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    opacity: 0.8,
    pointerEvents: "none",
    position: "absolute",
    zIndex: 10,
    left: "1px",
    paddingLeft: "calc(0.75rem - 1px)",
  },
  startAddonSm: {
    paddingLeft: "calc(0.625rem - 1px)",
  },
  // Room for the leading icon and for the trailing trigger/clear button.
  inputWithStartAddon: {
    paddingLeft: {
      default: "calc(2.125rem - 1px)",
      [consts.sm]: "calc(2rem - 1px)",
    },
  },
  inputWithStartAddonSm: {
    paddingLeft: {
      default: "calc(1.875rem - 1px)",
      [consts.sm]: "calc(1.75rem - 1px)",
    },
  },
  inputWithEndButton: {
    paddingRight: "1.75rem",
  },
  inputWithEndButtonSm: {
    paddingRight: "1.625rem",
  },
  endButton: {
    borderColor: "transparent",
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "center",
    cursor: "pointer",
    display: "inline-flex",
    flexShrink: 0,
    justifyContent: "center",
    opacity: {
      default: 0.8,
      ":hover": 1,
    },
    outlineStyle: "none",
    position: "absolute",
    transitionProperty: "color, background-color, box-shadow, opacity",
    translate: "0 -50%",
    height: {
      default: "2rem",
      [consts.sm]: "1.75rem",
    },
    right: "0.125rem",
    top: "50%",
    width: {
      default: "2rem",
      [consts.sm]: "1.75rem",
    },
    "::after": {
      content: {
        default: "none",
        [consts.pointerCoarse]: '""',
      },
      position: "absolute",
      minHeight: "2.75rem",
      minWidth: "2.75rem",
    },
  },
  endButtonSm: {
    right: 0,
  },
  endButtonIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
    pointerEvents: "none",
    height: {
      default: "0.875rem",
      [consts.sm]: "0.75rem",
    },
    width: {
      default: "0.875rem",
      [consts.sm]: "0.75rem",
    },
  },
  positioner: {
    userSelect: "none",
    zIndex: 50,
  },
  surface: {
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.popover,
    boxShadow: shadows.overlay,
    display: "flex",
    position: "relative",
    transformOrigin: "var(--transform-origin)",
    transitionProperty: "scale, opacity",
    maxHeight: "100%",
    maxWidth: "var(--available-width)",
    minWidth: "var(--anchor-width)",
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: shadows.edge,
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
  popup: {
    flex: "1",
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    maxHeight: "min(var(--available-height), 23rem)",
  },
  item: {
    borderRadius: `calc(${radius.xl} - 0.375rem)`,
    paddingBlock: "0.375rem",
    paddingInline: "0.75rem",
    alignItems: "center",
    backgroundColor: {
      "[data-highlighted]": colors.accent,
      default: null,
    },
    color: {
      "[data-highlighted]": colors.accentForeground,
      default: null,
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
    },
    outlineStyle: "none",
    pointerEvents: {
      "[data-disabled]": "none",
      default: null,
    },
    userSelect: "none",
    minHeight: {
      default: "2.5rem",
      [consts.sm]: "2.25rem",
    },
  },
  separator: {
    marginBlock: "0.375rem",
    marginInline: "0.75rem",
    backgroundColor: colors.border,
    display: {
      default: null,
      ":last-child": "none",
    },
    height: "1px",
  },
  groupLabel: {
    paddingBlock: "0.375rem",
    paddingInline: "0.5rem",
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 500,
    lineHeight: "1rem",
  },
  empty: {
    padding: {
      default: "0.5rem",
      ":empty": 0,
    },
    color: colors.mutedForeground,
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    textAlign: "center",
  },
  list: {
    padding: {
      default: "0.375rem",
      ":empty": 0,
    },
    scrollPaddingBottom: "0.25rem",
    scrollPaddingTop: "0.25rem",
  },
  status: {
    margin: {
      default: null,
      ":empty": 0,
    },
    paddingBlock: "0.5rem",
    paddingInline: "0.75rem",
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 500,
    lineHeight: "1rem",
  },
})

export function AutocompleteInput({
  className,
  showTrigger = false,
  showClear = false,
  startAddon,
  size,
  triggerProps,
  clearProps,
  sx,
  ...props
}: Omit<AutocompletePrimitive.Input.Props, "size"> & {
  showTrigger?: boolean
  showClear?: boolean
  startAddon?: React.ReactNode
  size?: "sm" | "default" | "lg" | number
  ref?: React.Ref<HTMLInputElement>
  triggerProps?: AutocompletePrimitive.Trigger.Props
  clearProps?: AutocompletePrimitive.Clear.Props
  sx?: Sx
}): React.ReactElement {
  const sizeValue = (size ?? "default") as "sm" | "default" | "lg" | number
  const isSm = sizeValue === "sm"
  const groupProps = stylex.props(styles.inputGroup)
  const addonProps = stylex.props(styles.startAddon, isSm && styles.startAddonSm)
  const hasEndButton = showTrigger || showClear
  const inputSx: Sx = [
    Boolean(startAddon) && (isSm ? styles.inputWithStartAddonSm : styles.inputWithStartAddon),
    hasEndButton && (isSm ? styles.inputWithEndButtonSm : styles.inputWithEndButton),
    sx,
  ]
  const endButtonProps = stylex.props(styles.endButton, isSm && styles.endButtonSm)
  const iconProps = stylex.props(styles.endButtonIcon)

  return (
    <AutocompletePrimitive.InputGroup
      className={groupProps.className}
      data-slot="autocomplete-input-group"
      style={groupProps.style}
    >
      {startAddon && (
        <div
          aria-hidden="true"
          className={addonProps.className}
          data-slot="autocomplete-start-addon"
          style={addonProps.style}
        >
          {startAddon}
        </div>
      )}
      <AutocompletePrimitive.Input
        className={className}
        data-slot="autocomplete-input"
        render={<Input nativeInput size={sizeValue} sx={inputSx} />}
        {...props}
      />
      {showTrigger && !showClear && (
        <AutocompleteTrigger
          className={endButtonProps.className}
          style={endButtonProps.style}
          {...triggerProps}
        >
          <AutocompletePrimitive.Icon data-slot="autocomplete-icon">
            <ChevronsUpDown className={iconProps.className} style={iconProps.style} />
          </AutocompletePrimitive.Icon>
        </AutocompleteTrigger>
      )}
      {showClear && (
        <AutocompleteClear
          className={endButtonProps.className}
          style={endButtonProps.style}
          {...clearProps}
        />
      )}
    </AutocompletePrimitive.InputGroup>
  )
}

export function AutocompletePopup({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  alignOffset,
  align = "start",
  anchor,
  portalProps,
  sx,
  ...props
}: AutocompletePrimitive.Popup.Props & {
  align?: AutocompletePrimitive.Positioner.Props["align"]
  sideOffset?: AutocompletePrimitive.Positioner.Props["sideOffset"]
  alignOffset?: AutocompletePrimitive.Positioner.Props["alignOffset"]
  side?: AutocompletePrimitive.Positioner.Props["side"]
  anchor?: AutocompletePrimitive.Positioner.Props["anchor"]
  portalProps?: AutocompletePrimitive.Portal.Props
  sx?: Sx
}): React.ReactElement {
  const positionerProps = stylex.props(styles.positioner)
  const surfaceProps = stylex.props(styles.surface, sx)
  const popupProps = stylex.props(styles.popup)

  return (
    <AutocompletePrimitive.Portal {...portalProps}>
      <AutocompletePrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className={positionerProps.className}
        data-slot="autocomplete-positioner"
        side={side}
        sideOffset={sideOffset}
        style={positionerProps.style}
      >
        <span className={cn(surfaceProps.className, className)} style={surfaceProps.style}>
          <AutocompletePrimitive.Popup
            className={popupProps.className}
            data-slot="autocomplete-popup"
            style={popupProps.style}
            {...props}
          >
            {children}
          </AutocompletePrimitive.Popup>
        </span>
      </AutocompletePrimitive.Positioner>
    </AutocompletePrimitive.Portal>
  )
}

export function AutocompleteItem({
  className,
  children,
  sx,
  ...props
}: AutocompletePrimitive.Item.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.item, sx)

  return (
    <AutocompletePrimitive.Item
      className={cn(styleProps.className, className)}
      data-slot="autocomplete-item"
      style={styleProps.style}
      {...props}
    >
      {children}
    </AutocompletePrimitive.Item>
  )
}

export function AutocompleteSeparator({
  className,
  sx,
  ...props
}: AutocompletePrimitive.Separator.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.separator, sx)

  return (
    <AutocompletePrimitive.Separator
      className={cn(styleProps.className, className)}
      data-slot="autocomplete-separator"
      style={styleProps.style}
      {...props}
    />
  )
}

export function AutocompleteGroup({
  className,
  sx,
  ...props
}: AutocompletePrimitive.Group.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(sx)

  return (
    <AutocompletePrimitive.Group
      className={cn(styleProps.className, className)}
      data-slot="autocomplete-group"
      style={styleProps.style}
      {...props}
    />
  )
}

export function AutocompleteGroupLabel({
  className,
  sx,
  ...props
}: AutocompletePrimitive.GroupLabel.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.groupLabel, sx)

  return (
    <AutocompletePrimitive.GroupLabel
      className={cn(styleProps.className, className)}
      data-slot="autocomplete-group-label"
      style={styleProps.style}
      {...props}
    />
  )
}

export function AutocompleteEmpty({
  className,
  sx,
  ...props
}: AutocompletePrimitive.Empty.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.empty, sx)

  return (
    <AutocompletePrimitive.Empty
      className={cn(styleProps.className, className)}
      data-slot="autocomplete-empty"
      style={styleProps.style}
      {...props}
    />
  )
}

export function AutocompleteRow({
  className,
  sx,
  ...props
}: AutocompletePrimitive.Row.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(sx)

  return (
    <AutocompletePrimitive.Row
      className={cn(styleProps.className, className)}
      data-slot="autocomplete-row"
      style={styleProps.style}
      {...props}
    />
  )
}

export function AutocompleteValue({
  ...props
}: AutocompletePrimitive.Value.Props): React.ReactElement {
  return <AutocompletePrimitive.Value data-slot="autocomplete-value" {...props} />
}

export function AutocompleteList({
  className,
  sx,
  ...props
}: AutocompletePrimitive.List.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.list, sx)

  return (
    <ScrollArea scrollbarGutter scrollFade>
      <AutocompletePrimitive.List
        className={cn(styleProps.className, className)}
        data-slot="autocomplete-list"
        style={styleProps.style}
        {...props}
      />
    </ScrollArea>
  )
}

export function AutocompleteClear({
  className,
  style,
  sx,
  ...props
}: AutocompletePrimitive.Clear.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(sx)
  const iconProps = stylex.props(styles.endButtonIcon)

  return (
    <AutocompletePrimitive.Clear
      className={cn(styleProps.className, className)}
      data-slot="autocomplete-clear"
      style={{ ...styleProps.style, ...(style as React.CSSProperties) }}
      {...props}
    >
      <Close className={iconProps.className} style={iconProps.style} />
    </AutocompletePrimitive.Clear>
  )
}

export function AutocompleteStatus({
  className,
  sx,
  ...props
}: AutocompletePrimitive.Status.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.status, sx)

  return (
    <AutocompletePrimitive.Status
      className={cn(styleProps.className, className)}
      data-slot="autocomplete-status"
      style={styleProps.style}
      {...props}
    />
  )
}

export function AutocompleteCollection({
  ...props
}: AutocompletePrimitive.Collection.Props): React.ReactElement {
  return <AutocompletePrimitive.Collection data-slot="autocomplete-collection" {...props} />
}

export function AutocompleteTrigger({
  className,
  children,
  style,
  sx,
  ...props
}: AutocompletePrimitive.Trigger.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(sx)

  return (
    <AutocompletePrimitive.Trigger
      className={cn(styleProps.className, className)}
      data-slot="autocomplete-trigger"
      style={{ ...styleProps.style, ...(style as React.CSSProperties) }}
      {...props}
    >
      {children}
    </AutocompletePrimitive.Trigger>
  )
}

export const useAutocompleteFilter: typeof AutocompletePrimitive.useFilter =
  AutocompletePrimitive.useFilter

export { AutocompletePrimitive }
