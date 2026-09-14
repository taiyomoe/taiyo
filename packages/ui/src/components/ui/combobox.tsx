"use client"

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import * as stylex from "@stylexjs/stylex"
import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronsUpDown, Close } from "@/components/icons"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { comboboxPopupMarker } from "../../styles/markers.stylex"
import type { Sx } from "../../styles/sx"
import { colors, consts, radius, shadows } from "../../styles/tokens.stylex"

export const ComboboxContext: React.Context<{
  chipsRef: React.RefObject<Element | null> | null
  multiple: boolean
}> = React.createContext<{
  chipsRef: React.RefObject<Element | null> | null
  multiple: boolean
}>({
  chipsRef: null,
  multiple: false,
})

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
  inputKeepOpacity: {
    opacity: 1,
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
    transitionProperty: "opacity",
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
  icon: {
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
  chipsInput: {
    flex: "1",
    backgroundColor: "transparent",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    outlineStyle: "none",
    minWidth: "3rem",
    paddingLeft: "0.5rem",
  },
  chipsInputSm: {
    paddingLeft: "0.375rem",
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
    gap: "0.625rem",
    paddingBlock: "0.375rem",
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
    display: "grid",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    gridTemplateColumns: "1rem 1fr",
    opacity: {
      "[data-disabled]": 0.64,
      default: null,
    },
    outlineStyle: "none",
    pointerEvents: {
      "[data-disabled]": "none",
      default: null,
    },
    minHeight: {
      default: "2.5rem",
      [consts.sm]: "2.25rem",
    },
    minWidth: {
      default: null,
      [stylex.when.ancestor('[data-side="none"]', comboboxPopupMarker)]:
        "calc(var(--anchor-width) + 1.25rem)",
    },
    paddingLeft: "0.75rem",
    paddingRight: "1.25rem",
  },
  itemIndicator: {
    gridColumnStart: "1",
  },
  itemContent: {
    gridColumnStart: "2",
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
  // The chips field is the multi-select variant of the field surface.
  chips: {
    padding: "calc(0.25rem - 1px)",
    borderColor: {
      default: colors.input,
      ":focus-within": colors.ring,
    },
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.25rem",
    backgroundClip: "padding-box",
    backgroundColor: colors.field,
    boxShadow: {
      default: "0 1px 2px 0 rgb(0 0 0 / 5%)",
      ":focus-within": "none",
    },
    display: "inline-flex",
    flexWrap: "wrap",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    outlineColor: `color-mix(in srgb, ${colors.ring} 24%, transparent)`,
    outlineStyle: {
      default: "none",
      ":focus-within": "solid",
    },
    outlineWidth: 3,
    position: "relative",
    transitionProperty: "box-shadow, border-color",
    minHeight: {
      default: "2.75rem",
      [consts.sm]: "2.5rem",
    },
    width: "100%",
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: {
        default: shadows.edge,
        ":focus-within": "none",
      },
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
  chipsStartAddon: {
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    opacity: 0.8,
    paddingLeft: "0.5rem",
  },
  chip: {
    borderRadius: "calc(0.7rem - 1px)",
    alignItems: "center",
    backgroundColor: colors.accent,
    color: colors.accentForeground,
    display: "flex",
    fontSize: {
      default: "0.875rem",
      [consts.sm]: "0.75rem",
    },
    fontWeight: 500,
    outlineStyle: "none",
    minHeight: {
      default: "1.75rem",
      [consts.sm]: "1.5rem",
    },
    paddingLeft: "0.5rem",
  },
  chipRemove: {
    paddingInline: "0.375rem",
    cursor: "pointer",
    flexShrink: 0,
    opacity: {
      default: 0.8,
      ":hover": 1,
    },
    height: "100%",
  },
  chipIcon: {
    height: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    width: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
  },
})

export function Combobox<Value, Multiple extends boolean | undefined = false>(
  props: ComboboxPrimitive.Root.Props<Value, Multiple>,
): React.ReactElement {
  const chipsRef = React.useRef<Element | null>(null)
  const contextValue = React.useMemo(
    () => ({ chipsRef, multiple: !!props.multiple }),
    [props.multiple],
  )

  return (
    <ComboboxContext.Provider value={contextValue}>
      <ComboboxPrimitive.Root {...props} />
    </ComboboxContext.Provider>
  )
}

export function ComboboxChipsInput({
  className,
  size,
  sx,
  ...props
}: Omit<ComboboxPrimitive.Input.Props, "size"> & {
  size?: "sm" | "default" | "lg" | number
  ref?: React.Ref<HTMLInputElement>
  sx?: Sx
}): React.ReactElement {
  const sizeValue = (size ?? "default") as "sm" | "default" | "lg" | number
  const styleProps = stylex.props(styles.chipsInput, sizeValue === "sm" && styles.chipsInputSm, sx)

  return (
    <ComboboxPrimitive.Input
      className={cn(styleProps.className, className)}
      data-size={typeof sizeValue === "string" ? sizeValue : undefined}
      data-slot="combobox-chips-input"
      size={typeof sizeValue === "number" ? sizeValue : undefined}
      style={styleProps.style}
      {...props}
    />
  )
}

export function ComboboxInput({
  className,
  showTrigger = true,
  showClear = false,
  startAddon,
  size,
  triggerProps,
  clearProps,
  sx,
  ...props
}: Omit<ComboboxPrimitive.Input.Props, "size"> & {
  showTrigger?: boolean
  showClear?: boolean
  startAddon?: React.ReactNode
  size?: "sm" | "default" | "lg" | number
  ref?: React.Ref<HTMLInputElement>
  triggerProps?: ComboboxPrimitive.Trigger.Props
  clearProps?: ComboboxPrimitive.Clear.Props
  sx?: Sx
}): React.ReactElement {
  const sizeValue = (size ?? "default") as "sm" | "default" | "lg" | number
  const isSm = sizeValue === "sm"
  const groupProps = stylex.props(styles.inputGroup)
  const addonProps = stylex.props(styles.startAddon, isSm && styles.startAddonSm)
  const hasEndButton = showTrigger || showClear
  const inputSx: Sx = [
    styles.inputKeepOpacity,
    Boolean(startAddon) && (isSm ? styles.inputWithStartAddonSm : styles.inputWithStartAddon),
    hasEndButton && (isSm ? styles.inputWithEndButtonSm : styles.inputWithEndButton),
    sx,
  ]
  const endButtonProps = stylex.props(styles.endButton, isSm && styles.endButtonSm)
  const iconProps = stylex.props(styles.icon)

  return (
    <ComboboxPrimitive.InputGroup
      className={groupProps.className}
      data-slot="combobox-input-group"
      style={groupProps.style}
    >
      {startAddon && (
        <div
          aria-hidden="true"
          className={addonProps.className}
          data-slot="combobox-start-addon"
          style={addonProps.style}
        >
          {startAddon}
        </div>
      )}
      <ComboboxPrimitive.Input
        className={className}
        data-slot="combobox-input"
        render={<Input nativeInput size={sizeValue} sx={inputSx} />}
        {...props}
      />
      {showTrigger && !showClear && (
        <ComboboxTrigger
          className={endButtonProps.className}
          style={endButtonProps.style}
          {...triggerProps}
        >
          <ComboboxPrimitive.Icon data-slot="combobox-icon">
            <ChevronsUpDown className={iconProps.className} style={iconProps.style} />
          </ComboboxPrimitive.Icon>
        </ComboboxTrigger>
      )}
      {showClear && (
        <ComboboxClear
          className={endButtonProps.className}
          style={endButtonProps.style}
          {...clearProps}
        >
          <Close className={iconProps.className} style={iconProps.style} />
        </ComboboxClear>
      )}
    </ComboboxPrimitive.InputGroup>
  )
}

export function ComboboxTrigger({
  className,
  children,
  style,
  sx,
  ...props
}: ComboboxPrimitive.Trigger.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(sx)

  return (
    <ComboboxPrimitive.Trigger
      className={cn(styleProps.className, className)}
      data-slot="combobox-trigger"
      style={{ ...styleProps.style, ...(style as React.CSSProperties) }}
      {...props}
    >
      {children}
    </ComboboxPrimitive.Trigger>
  )
}

export function ComboboxPopup({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  alignOffset,
  align = "start",
  anchor: anchorProp,
  portalProps,
  sx,
  ...props
}: ComboboxPrimitive.Popup.Props & {
  align?: ComboboxPrimitive.Positioner.Props["align"]
  sideOffset?: ComboboxPrimitive.Positioner.Props["sideOffset"]
  alignOffset?: ComboboxPrimitive.Positioner.Props["alignOffset"]
  side?: ComboboxPrimitive.Positioner.Props["side"]
  anchor?: ComboboxPrimitive.Positioner.Props["anchor"]
  portalProps?: ComboboxPrimitive.Portal.Props
  sx?: Sx
}): React.ReactElement {
  const { chipsRef } = React.useContext(ComboboxContext)
  const anchor = anchorProp ?? chipsRef
  const positionerProps = stylex.props(styles.positioner)
  const surfaceProps = stylex.props(styles.surface, sx)
  const popupProps = stylex.props(styles.popup, stylex.defaultMarker(), comboboxPopupMarker)

  return (
    <ComboboxPrimitive.Portal {...portalProps}>
      <ComboboxPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className={positionerProps.className}
        data-slot="combobox-positioner"
        side={side}
        sideOffset={sideOffset}
        style={positionerProps.style}
      >
        <span className={cn(surfaceProps.className, className)} style={surfaceProps.style}>
          <ComboboxPrimitive.Popup
            className={popupProps.className}
            data-slot="combobox-popup"
            style={popupProps.style}
            {...props}
          >
            {children}
          </ComboboxPrimitive.Popup>
        </span>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

export function ComboboxItem({
  className,
  children,
  sx,
  ...props
}: ComboboxPrimitive.Item.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.item, sx)
  const indicatorProps = stylex.props(styles.itemIndicator)
  const contentProps = stylex.props(styles.itemContent)
  const iconProps = stylex.props(styles.icon)

  return (
    <ComboboxPrimitive.Item
      className={cn(styleProps.className, className)}
      data-slot="combobox-item"
      style={styleProps.style}
      {...props}
    >
      <ComboboxPrimitive.ItemIndicator
        className={indicatorProps.className}
        style={indicatorProps.style}
      >
        <svg
          aria-hidden="true"
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
      </ComboboxPrimitive.ItemIndicator>
      <div className={contentProps.className} style={contentProps.style}>
        {children}
      </div>
    </ComboboxPrimitive.Item>
  )
}

export function ComboboxSeparator({
  className,
  sx,
  ...props
}: ComboboxPrimitive.Separator.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.separator, sx)

  return (
    <ComboboxPrimitive.Separator
      className={cn(styleProps.className, className)}
      data-slot="combobox-separator"
      style={styleProps.style}
      {...props}
    />
  )
}

export function ComboboxGroup({
  className,
  sx,
  ...props
}: ComboboxPrimitive.Group.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(sx)

  return (
    <ComboboxPrimitive.Group
      className={cn(styleProps.className, className)}
      data-slot="combobox-group"
      style={styleProps.style}
      {...props}
    />
  )
}

export function ComboboxGroupLabel({
  className,
  sx,
  ...props
}: ComboboxPrimitive.GroupLabel.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.groupLabel, sx)

  return (
    <ComboboxPrimitive.GroupLabel
      className={cn(styleProps.className, className)}
      data-slot="combobox-group-label"
      style={styleProps.style}
      {...props}
    />
  )
}

export function ComboboxEmpty({
  className,
  sx,
  ...props
}: ComboboxPrimitive.Empty.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.empty, sx)

  return (
    <ComboboxPrimitive.Empty
      className={cn(styleProps.className, className)}
      data-slot="combobox-empty"
      style={styleProps.style}
      {...props}
    />
  )
}

export function ComboboxRow({
  className,
  sx,
  ...props
}: ComboboxPrimitive.Row.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(sx)

  return (
    <ComboboxPrimitive.Row
      className={cn(styleProps.className, className)}
      data-slot="combobox-row"
      style={styleProps.style}
      {...props}
    />
  )
}

export function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props): React.ReactElement {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />
}

export function ComboboxList({
  className,
  sx,
  ...props
}: ComboboxPrimitive.List.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.list, sx)

  return (
    <ScrollArea scrollbarGutter scrollFade>
      <ComboboxPrimitive.List
        className={cn(styleProps.className, className)}
        data-slot="combobox-list"
        style={styleProps.style}
        {...props}
      />
    </ScrollArea>
  )
}

export function ComboboxClear({
  className,
  children,
  style,
  sx,
  ...props
}: ComboboxPrimitive.Clear.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(sx)
  const iconProps = stylex.props(styles.icon)

  return (
    <ComboboxPrimitive.Clear
      className={cn(styleProps.className, className)}
      data-slot="combobox-clear"
      style={{ ...styleProps.style, ...(style as React.CSSProperties) }}
      {...props}
    >
      {children ?? <Close className={iconProps.className} style={iconProps.style} />}
    </ComboboxPrimitive.Clear>
  )
}

export function ComboboxStatus({
  className,
  sx,
  ...props
}: ComboboxPrimitive.Status.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.status, sx)

  return (
    <ComboboxPrimitive.Status
      className={cn(styleProps.className, className)}
      data-slot="combobox-status"
      style={styleProps.style}
      {...props}
    />
  )
}

export function ComboboxCollection(props: ComboboxPrimitive.Collection.Props): React.ReactElement {
  return <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
}

export function ComboboxChips({
  className,
  children,
  startAddon,
  sx,
  ...props
}: ComboboxPrimitive.Chips.Props & {
  startAddon?: React.ReactNode
  sx?: Sx
}): React.ReactElement {
  const { chipsRef } = React.useContext(ComboboxContext)
  const styleProps = stylex.props(styles.chips, sx)
  const addonProps = stylex.props(styles.chipsStartAddon)

  return (
    <ComboboxPrimitive.Chips
      className={cn(styleProps.className, className)}
      data-slot="combobox-chips"
      ref={chipsRef as React.Ref<HTMLDivElement> | null}
      style={styleProps.style}
      {...props}
    >
      {startAddon && (
        <div
          aria-hidden="true"
          className={addonProps.className}
          data-slot="combobox-start-addon"
          style={addonProps.style}
        >
          {startAddon}
        </div>
      )}
      {children}
    </ComboboxPrimitive.Chips>
  )
}

export function ComboboxChip({
  children,
  removeProps,
  sx,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  removeProps?: ComboboxPrimitive.ChipRemove.Props
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.chip, sx)

  return (
    <ComboboxPrimitive.Chip
      className={styleProps.className}
      data-slot="combobox-chip"
      style={styleProps.style}
      {...props}
    >
      {children}
      <ComboboxChipRemove {...removeProps} />
    </ComboboxPrimitive.Chip>
  )
}

export function ComboboxChipRemove({
  sx,
  ...props
}: ComboboxPrimitive.ChipRemove.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.chipRemove, sx)
  const iconProps = stylex.props(styles.chipIcon)

  return (
    <ComboboxPrimitive.ChipRemove
      aria-label="Remove"
      className={styleProps.className}
      data-slot="combobox-chip-remove"
      style={styleProps.style}
      {...props}
    >
      <Close className={iconProps.className} style={iconProps.style} />
    </ComboboxPrimitive.ChipRemove>
  )
}

export const useComboboxFilter: typeof ComboboxPrimitive.useFilter = ComboboxPrimitive.useFilter

export { ComboboxPrimitive }
