"use client"

import { Select as SelectPrimitive } from "@base-ui/react/select"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"
import type * as React from "react"
import { cn } from "@/utils/cn"
import { Check, ChevronDown, ChevronUp, ChevronsUpDown } from "@/components/icons"
import { selectPopupMarker } from "../../styles/markers.stylex"
import type { Sx } from "../../styles/sx"
import { colors, consts, radius, shadows } from "../../styles/tokens.stylex"

export const Select: typeof SelectPrimitive.Root = SelectPrimitive.Root

export type SelectSize = "sm" | "default" | "lg"

const styles = stylex.create({
  trigger: {
    borderColor: {
      "[aria-invalid]": `color-mix(in srgb, ${colors.destructive} 36%, transparent)`,
      default: colors.input,
      ":focus-visible": colors.ring,
    },
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.5rem",
    paddingInline: "calc(0.75rem - 1px)",
    alignItems: "center",
    backgroundClip: "padding-box",
    backgroundColor: colors.field,
    boxShadow: {
      "[data-disabled]": "none",
      "[data-pressed]": "none",
      default: "0 1px 2px 0 rgb(0 0 0 / 5%)",
      ":focus-visible": "none",
    },
    color: colors.foreground,
    display: "inline-flex",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    justifyContent: "space-between",
    opacity: {
      "[data-disabled]": 0.64,
      default: null,
    },
    outlineColor: `color-mix(in srgb, ${colors.ring} 24%, transparent)`,
    outlineStyle: {
      default: "none",
      ":focus-visible": "solid",
    },
    outlineWidth: 3,
    pointerEvents: {
      "[data-disabled]": "none",
      default: null,
    },
    position: "relative",
    textAlign: "left",
    transitionProperty: "box-shadow, border-color",
    userSelect: "none",
    minHeight: {
      default: "2.75rem",
      [consts.sm]: "2.5rem",
    },
    minWidth: "9rem",
    width: "100%",
    "::after": {
      content: {
        default: "none",
        [consts.pointerCoarse]: '""',
      },
      position: "absolute",
      height: "100%",
      minHeight: "2.75rem",
      width: "100%",
    },
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: {
        default: shadows.edge,
        ":focus-visible": "none",
      },
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
  triggerInvalid: {
    borderColor: {
      default: `color-mix(in srgb, ${colors.destructive} 36%, transparent)`,
      ":focus-visible": `color-mix(in srgb, ${colors.destructive} 64%, transparent)`,
    },
    outlineColor: `color-mix(in srgb, ${colors.destructive} 16%, transparent)`,
  },
  triggerSm: {
    gap: "0.375rem",
    paddingInline: "calc(0.625rem - 1px)",
    minHeight: {
      default: "2.25rem",
      [consts.sm]: "2rem",
    },
  },
  triggerLg: {
    minHeight: {
      default: "3.25rem",
      [consts.sm]: "3rem",
    },
  },
  triggerIcon: {
    color: colors.mutedForeground,
    marginInlineEnd: "-0.25rem",
    height: {
      default: "0.875rem",
      [consts.sm]: "0.75rem",
    },
    width: {
      default: "0.875rem",
      [consts.sm]: "0.75rem",
    },
  },
  value: {
    flex: "1",
    overflow: "hidden",
    color: {
      "[data-placeholder]": colors.mutedForeground,
      default: null,
    },
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  positioner: {
    userSelect: "none",
    zIndex: 50,
  },
  popup: {
    color: colors.foreground,
    outlineStyle: "none",
    transformOrigin: "var(--transform-origin)",
  },
  surface: {
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.popover,
    boxShadow: shadows.overlay,
    position: "relative",
    height: "100%",
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
  list: {
    padding: "0.375rem",
    maxHeight: "var(--available-height)",
    overflowY: "auto",
  },
  scrollArrow: {
    alignItems: "center",
    cursor: "default",
    display: "flex",
    justifyContent: "center",
    zIndex: 50,
    height: "1.5rem",
    width: "100%",
  },
  scrollArrowUp: {
    top: 0,
    "::before": {
      insetInline: "1px",
      backgroundImage: `linear-gradient(to bottom, ${colors.popover} 50%, transparent)`,
      borderStartEndRadius: "calc(1.225rem - 1px)",
      borderStartStartRadius: "calc(1.225rem - 1px)",
      content: '""',
      pointerEvents: "none",
      position: "absolute",
      height: "200%",
      top: "1px",
    },
  },
  scrollArrowDown: {
    bottom: 0,
    "::before": {
      insetInline: "1px",
      backgroundImage: `linear-gradient(to top, ${colors.popover} 50%, transparent)`,
      borderEndEndRadius: "calc(1.225rem - 1px)",
      borderEndStartRadius: "calc(1.225rem - 1px)",
      content: '""',
      pointerEvents: "none",
      position: "absolute",
      bottom: "1px",
      height: "200%",
    },
  },
  scrollArrowIcon: {
    position: "relative",
    height: {
      default: "1.125rem",
      [consts.sm]: "1rem",
    },
    width: {
      default: "1.125rem",
      [consts.sm]: "1rem",
    },
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
      [stylex.when.ancestor('[data-side="none"]', selectPopupMarker)]:
        "calc(var(--anchor-width) + 1.25rem)",
    },
    paddingLeft: "0.75rem",
    paddingRight: "1.25rem",
  },
  itemIndicator: {
    gridColumnStart: "1",
  },
  itemIndicatorIcon: {
    height: {
      default: "1.125rem",
      [consts.sm]: "1rem",
    },
    width: {
      default: "1.125rem",
      [consts.sm]: "1rem",
    },
  },
  itemText: {
    gridColumnStart: "2",
    minWidth: 0,
  },
  separator: {
    marginBlock: "0.375rem",
    marginInline: "0.75rem",
    backgroundColor: colors.border,
    height: "1px",
  },
  label: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.foreground,
    cursor: "default",
    display: "inline-flex",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    fontWeight: 500,
    lineHeight: {
      default: "1.125rem",
      [consts.sm]: "1rem",
    },
    marginBottom: "0.5rem",
  },
  groupLabel: {
    paddingBlock: "0.375rem",
    paddingInline: "0.5rem",
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 500,
    lineHeight: "1rem",
  },
})
const SIZE_STYLE = {
  default: null,
  lg: styles.triggerLg,
  sm: styles.triggerSm,
} as const

export interface SelectButtonProps extends useRender.ComponentProps<"button"> {
  size?: SelectSize
  sx?: Sx
}

export function SelectTrigger({
  className,
  size = "default",
  children,
  sx,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: SelectSize
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(
    styles.trigger,
    SIZE_STYLE[size],
    props["aria-invalid"] !== undefined && styles.triggerInvalid,
    sx,
  )
  const iconProps = stylex.props(styles.triggerIcon)

  return (
    <SelectPrimitive.Trigger
      className={cn(styleProps.className, className)}
      data-slot="select-trigger"
      style={styleProps.style}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon data-slot="select-icon">
        <ChevronsUpDown className={iconProps.className} style={iconProps.style} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export function SelectValue({
  className,
  sx,
  ...props
}: SelectPrimitive.Value.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.value, sx)

  return (
    <SelectPrimitive.Value
      className={cn(styleProps.className, className)}
      data-slot="select-value"
      style={styleProps.style}
      {...props}
    />
  )
}

export function SelectPopup({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = true,
  anchor,
  portalProps,
  sx,
  ...props
}: SelectPrimitive.Popup.Props & {
  portalProps?: SelectPrimitive.Portal.Props
  side?: SelectPrimitive.Positioner.Props["side"]
  sideOffset?: SelectPrimitive.Positioner.Props["sideOffset"]
  align?: SelectPrimitive.Positioner.Props["align"]
  alignOffset?: SelectPrimitive.Positioner.Props["alignOffset"]
  alignItemWithTrigger?: SelectPrimitive.Positioner.Props["alignItemWithTrigger"]
  anchor?: SelectPrimitive.Positioner.Props["anchor"]
  sx?: Sx
}): React.ReactElement {
  const positionerProps = stylex.props(styles.positioner)
  const popupProps = stylex.props(styles.popup, stylex.defaultMarker(), selectPopupMarker, sx)
  const surfaceProps = stylex.props(styles.surface)
  const listProps = stylex.props(styles.list)
  const upArrowProps = stylex.props(styles.scrollArrow, styles.scrollArrowUp)
  const downArrowProps = stylex.props(styles.scrollArrow, styles.scrollArrowDown)
  const arrowIconProps = stylex.props(styles.scrollArrowIcon)

  return (
    <SelectPrimitive.Portal {...portalProps}>
      <SelectPrimitive.Positioner
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
        alignOffset={alignOffset}
        anchor={anchor}
        className={positionerProps.className}
        data-slot="select-positioner"
        side={side}
        sideOffset={sideOffset}
        style={positionerProps.style}
      >
        <SelectPrimitive.Popup
          className={popupProps.className}
          data-slot="select-popup"
          style={popupProps.style}
          {...props}
        >
          <SelectPrimitive.ScrollUpArrow
            className={upArrowProps.className}
            data-slot="select-scroll-up-arrow"
            style={upArrowProps.style}
          >
            <ChevronUp className={arrowIconProps.className} style={arrowIconProps.style} />
          </SelectPrimitive.ScrollUpArrow>
          <div className={surfaceProps.className} style={surfaceProps.style}>
            <SelectPrimitive.List
              className={cn(listProps.className, className)}
              data-slot="select-list"
              style={listProps.style}
            >
              {children}
            </SelectPrimitive.List>
          </div>
          <SelectPrimitive.ScrollDownArrow
            className={downArrowProps.className}
            data-slot="select-scroll-down-arrow"
            style={downArrowProps.style}
          >
            <ChevronDown className={arrowIconProps.className} style={arrowIconProps.style} />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

export function SelectItem({
  className,
  children,
  sx,
  ...props
}: SelectPrimitive.Item.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.item, sx)
  const indicatorProps = stylex.props(styles.itemIndicator)
  const iconProps = stylex.props(styles.itemIndicatorIcon)
  const textProps = stylex.props(styles.itemText)

  return (
    <SelectPrimitive.Item
      className={cn(styleProps.className, className)}
      data-slot="select-item"
      style={styleProps.style}
      {...props}
    >
      <SelectPrimitive.ItemIndicator
        className={indicatorProps.className}
        style={indicatorProps.style}
      >
        <Check className={iconProps.className} style={iconProps.style} />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText className={textProps.className} style={textProps.style}>
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

export function SelectSeparator({
  className,
  sx,
  ...props
}: SelectPrimitive.Separator.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.separator, sx)

  return (
    <SelectPrimitive.Separator
      className={cn(styleProps.className, className)}
      data-slot="select-separator"
      style={styleProps.style}
      {...props}
    />
  )
}

export function SelectGroup(props: SelectPrimitive.Group.Props): React.ReactElement {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

export function SelectLabel({
  className,
  sx,
  ...props
}: SelectPrimitive.Label.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.label, sx)

  return (
    <SelectPrimitive.Label
      className={cn(styleProps.className, className)}
      data-slot="select-label"
      style={styleProps.style}
      {...props}
    />
  )
}

export function SelectGroupLabel({
  className,
  sx,
  ...props
}: SelectPrimitive.GroupLabel.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.groupLabel, sx)

  return (
    <SelectPrimitive.GroupLabel
      className={cn(styleProps.className, className)}
      data-slot="select-group-label"
      style={styleProps.style}
      {...props}
    />
  )
}

export { SelectPrimitive, SelectPopup as SelectContent }
