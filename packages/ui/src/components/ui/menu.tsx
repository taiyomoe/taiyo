"use client"

import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import * as stylex from "@stylexjs/stylex"
import type * as React from "react"
import { cn } from "@/utils/cn"
import { ChevronRight } from "@/components/icons"
import { KbdSurface } from "@/components/ui/kbd"
import { colors, consts, font, radius, shadows } from "../../styles/tokens.stylex"
import { menuPopupMarker, menuSwitchItemMarker } from "../../styles/markers.stylex"
import type { Sx } from "../../styles/sx"

const styles = stylex.create({
  positioner: {
    zIndex: 50,
  },
  popup: {
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.popover,
    boxShadow: shadows.overlay,
    display: "flex",
    outlineStyle: "none",
    position: "relative",
    transformOrigin: "var(--transform-origin)",
    // Caller styles arrive through `sx`, which merges last and overrides
    // this directly — no escape hatch needed.
    minWidth: "8rem",
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: shadows.edge,
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
  scroller: {
    padding: "0.375rem",
    maxHeight: "var(--available-height)",
    overflowY: "auto",
    width: "100%",
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
      '[data-variant="destructive"]': colors.destructiveForeground,
      default: colors.foreground,
    },
    cursor: "default",
    display: "flex",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    lineHeight: {
      default: "1.5rem",
      [consts.sm]: "1.25rem",
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
    paddingLeft: {
      "[data-inset]": "2.25rem",
      default: "0.75rem",
    },
    paddingRight: "0.75rem",
  },
  checkItem: {
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
      default: colors.foreground,
    },
    cursor: "default",
    display: "grid",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    lineHeight: {
      default: "1.5rem",
      [consts.sm]: "1.25rem",
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
    minHeight: {
      default: "2.5rem",
      [consts.sm]: "2.25rem",
    },
    minWidth: {
      default: null,
      [stylex.when.ancestor('[data-side="none"]', menuPopupMarker)]:
        "calc(var(--anchor-width) + 1.25rem)",
    },
    paddingLeft: "0.75rem",
  },
  checkItemCheckbox: {
    gridTemplateColumns: "0.75rem 1fr",
    paddingRight: "1.25rem",
  },
  checkItemSwitch: {
    gap: "1.25rem",
    gridTemplateColumns: "1fr auto",
    paddingRight: "0.5rem",
  },
  checkIndicator: {
    gridColumnStart: "1",
    marginLeft: "-0.125rem",
  },
  labelColumn: {
    gridColumnStart: "2",
  },
  switchLabelColumn: {
    gridColumnStart: "1",
  },
  // The switch-style checkbox track: sunken well when unchecked, brand
  // primary when checked (same treatment as the standalone switch, one
  // spacing step smaller: thumb 1rem, 0.75rem at `sm`).
  switchTrack: {
    // The thumb reads `--thumb-size` back, so the responsive step lives here
    // once instead of on every thumb property (the lint only accepts a
    // `stylex.when` key at the first level of a condition, so the thumb
    // cannot nest a media query under its ancestor states).
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
      // Pressed squish: the thumb goes slightly oval while the item is held.
      [stylex.when.ancestor(":active", menuSwitchItemMarker)]:
        "var(--thumb-size) / calc(var(--thumb-size) * 1.1)",
    },
    aspectRatio: "1",
    backgroundColor: "#fff",
    boxShadow: shadows.thumb,
    display: "block",
    pointerEvents: "none",
    scale: {
      default: null,
      [stylex.when.ancestor(":active", menuSwitchItemMarker)]: "1.1 1",
    },
    transformOrigin: {
      default: "left",
      [stylex.when.ancestor("[data-checked]", menuSwitchItemMarker)]: "var(--thumb-size) 50%",
    },
    transitionDelay: "0s, 0s, 0.1s, 0s",
    transitionDuration: "0.15s, 0.15s, 0.1s, 0.15s",
    transitionProperty: "translate, border-radius, scale, transform-origin",
    translate: {
      default: null,
      [stylex.when.ancestor("[data-checked]", menuSwitchItemMarker)]:
        "calc(var(--thumb-size) - 4px)",
    },
    willChange: "transform",
    height: "100%",
  },
  groupLabel: {
    paddingBlock: "0.375rem",
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 500,
    lineHeight: "1rem",
    paddingLeft: {
      "[data-inset]": {
        default: "2.25rem",
        [consts.sm]: "2rem",
      },
      default: "0.75rem",
    },
    paddingRight: "0.75rem",
  },
  separator: {
    marginBlock: "0.375rem",
    marginInline: "0.75rem",
    backgroundColor: colors.border,
    height: 1,
  },
  shortcut: {
    gap: "0.25rem",
    alignItems: "center",
    color: `color-mix(in srgb, ${colors.mutedForeground} 72%, transparent)`,
    display: "inline-flex",
    fontFamily: font.sans,
    fontSize: "0.75rem",
    fontWeight: 500,
    lineHeight: "1rem",
    marginLeft: "auto",
    paddingLeft: "1.5rem",
  },
  subTrigger: {
    borderRadius: `calc(${radius.xl} - 0.375rem)`,
    gap: "0.625rem",
    paddingBlock: "0.375rem",
    alignItems: "center",
    backgroundColor: {
      "[data-highlighted]": colors.accent,
      "[data-popup-open]": colors.accent,
      default: null,
    },
    color: {
      "[data-highlighted]": colors.accentForeground,
      "[data-popup-open]": colors.accentForeground,
      default: colors.foreground,
    },
    display: "flex",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    lineHeight: {
      default: "1.5rem",
      [consts.sm]: "1.25rem",
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
    minHeight: {
      default: "2.5rem",
      [consts.sm]: "2.25rem",
    },
    paddingLeft: {
      "[data-inset]": "2.25rem",
      default: "0.75rem",
    },
    paddingRight: "0.75rem",
  },
  subTriggerChevron: {
    opacity: 0.8,
    marginLeft: "auto",
    marginRight: "-0.125rem",
  },
})

export const MenuCreateHandle: typeof MenuPrimitive.createHandle = MenuPrimitive.createHandle

export const Menu: typeof MenuPrimitive.Root = MenuPrimitive.Root

export const MenuPortal: typeof MenuPrimitive.Portal = MenuPrimitive.Portal

export function MenuTrigger({
  className,
  children,
  sx,
  ...props
}: MenuPrimitive.Trigger.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(sx)

  return (
    <MenuPrimitive.Trigger
      className={cn(styleProps.className, className)}
      data-slot="menu-trigger"
      style={styleProps.style}
      {...props}
    >
      {children}
    </MenuPrimitive.Trigger>
  )
}

export function MenuPopup({
  children,
  className,
  sideOffset = 4,
  align = "center",
  alignOffset,
  side = "bottom",
  anchor,
  portalProps,
  sx,
  ...props
}: MenuPrimitive.Popup.Props & {
  align?: MenuPrimitive.Positioner.Props["align"]
  sideOffset?: MenuPrimitive.Positioner.Props["sideOffset"]
  alignOffset?: MenuPrimitive.Positioner.Props["alignOffset"]
  side?: MenuPrimitive.Positioner.Props["side"]
  anchor?: MenuPrimitive.Positioner.Props["anchor"]
  portalProps?: MenuPrimitive.Portal.Props
  sx?: Sx
}): React.ReactElement {
  const positionerProps = stylex.props(styles.positioner)
  const popupProps = stylex.props(styles.popup, menuPopupMarker, sx)

  return (
    <MenuPortal {...portalProps}>
      <MenuPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className={positionerProps.className}
        data-slot="menu-positioner"
        side={side}
        sideOffset={sideOffset}
        style={positionerProps.style}
      >
        <MenuPrimitive.Popup
          className={cn(popupProps.className, className)}
          data-slot="menu-popup"
          style={popupProps.style}
          {...props}
        >
          <div sx={styles.scroller}>{children}</div>
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPortal>
  )
}

export function MenuGroup(props: MenuPrimitive.Group.Props): React.ReactElement {
  return <MenuPrimitive.Group data-slot="menu-group" {...props} />
}

export function MenuItem({
  className,
  inset,
  variant = "default",
  sx,
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean
  variant?: "default" | "destructive"
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.item, sx)

  return (
    <MenuPrimitive.Item
      className={cn(styleProps.className, className)}
      data-inset={inset}
      data-slot="menu-item"
      data-variant={variant}
      style={styleProps.style}
      {...props}
    />
  )
}

export function MenuCheckboxItem({
  className,
  children,
  checked,
  variant = "default",
  sx,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  variant?: "default" | "switch"
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(
    styles.checkItem,
    variant === "switch" ? styles.checkItemSwitch : styles.checkItemCheckbox,
    variant === "switch" && menuSwitchItemMarker,
    sx,
  )

  return (
    <MenuPrimitive.CheckboxItem
      checked={checked}
      className={cn(styleProps.className, className)}
      data-slot="menu-checkbox-item"
      style={styleProps.style}
      {...props}
    >
      {variant === "switch" ? (
        <>
          <span sx={styles.switchLabelColumn}>{children}</span>
          <MenuPrimitive.CheckboxItemIndicator {...stylex.props(styles.switchTrack)} keepMounted>
            <span sx={styles.switchThumb} />
          </MenuPrimitive.CheckboxItemIndicator>
        </>
      ) : (
        <>
          <MenuPrimitive.CheckboxItemIndicator {...stylex.props(styles.checkIndicator)}>
            <svg
              aria-hidden="true"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
            </svg>
          </MenuPrimitive.CheckboxItemIndicator>
          <span sx={styles.labelColumn}>{children}</span>
        </>
      )}
    </MenuPrimitive.CheckboxItem>
  )
}

export function MenuRadioGroup(props: MenuPrimitive.RadioGroup.Props): React.ReactElement {
  return <MenuPrimitive.RadioGroup data-slot="menu-radio-group" {...props} />
}

export function MenuRadioItem({
  className,
  children,
  sx,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.checkItem, styles.checkItemCheckbox, sx)

  return (
    <MenuPrimitive.RadioItem
      className={cn(styleProps.className, className)}
      data-slot="menu-radio-item"
      style={styleProps.style}
      {...props}
    >
      <MenuPrimitive.RadioItemIndicator {...stylex.props(styles.checkIndicator)}>
        <svg
          aria-hidden="true"
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
        </svg>
      </MenuPrimitive.RadioItemIndicator>
      <span sx={styles.labelColumn}>{children}</span>
    </MenuPrimitive.RadioItem>
  )
}

export function MenuGroupLabel({
  className,
  inset,
  sx,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.groupLabel, sx)

  return (
    <MenuPrimitive.GroupLabel
      className={cn(styleProps.className, className)}
      data-inset={inset}
      data-slot="menu-label"
      style={styleProps.style}
      {...props}
    />
  )
}

export function MenuSeparator({
  className,
  sx,
  ...props
}: MenuPrimitive.Separator.Props & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.separator, sx)

  return (
    <MenuPrimitive.Separator
      className={cn(styleProps.className, className)}
      data-slot="menu-separator"
      style={styleProps.style}
      {...props}
    />
  )
}

export function MenuShortcut({
  className,
  children,
  sx,
  ...props
}: React.ComponentProps<"kbd"> & {
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.shortcut, sx)

  return (
    <kbd
      className={cn(styleProps.className, className)}
      data-slot="menu-shortcut"
      style={styleProps.style}
      {...props}
    >
      {/* A shortcut reads as one chord, so the keys inside drop their chips. */}
      <KbdSurface>{children}</KbdSurface>
    </kbd>
  )
}

export function MenuSub(props: MenuPrimitive.SubmenuRoot.Props): React.ReactElement {
  return <MenuPrimitive.SubmenuRoot data-slot="menu-sub" {...props} />
}

export function MenuSubTrigger({
  className,
  inset,
  children,
  sx,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.subTrigger, sx)

  return (
    <MenuPrimitive.SubmenuTrigger
      className={cn(styleProps.className, className)}
      data-inset={inset}
      data-slot="menu-sub-trigger"
      style={styleProps.style}
      {...props}
    >
      {children}
      <ChevronRight {...stylex.props(styles.subTriggerChevron)} />
    </MenuPrimitive.SubmenuTrigger>
  )
}

export function MenuSubPopup({
  className,
  sideOffset = 0,
  alignOffset,
  align = "start",
  sx,
  ...props
}: MenuPrimitive.Popup.Props & {
  align?: MenuPrimitive.Positioner.Props["align"]
  sideOffset?: MenuPrimitive.Positioner.Props["sideOffset"]
  alignOffset?: MenuPrimitive.Positioner.Props["alignOffset"]
  sx?: Sx
}): React.ReactElement {
  const defaultAlignOffset = align !== "center" ? -5 : undefined

  return (
    <MenuPopup
      align={align}
      alignOffset={alignOffset ?? defaultAlignOffset}
      className={className}
      data-slot="menu-sub-content"
      side="inline-end"
      sideOffset={sideOffset}
      sx={sx}
      {...props}
    />
  )
}

export {
  MenuPrimitive,
  MenuCreateHandle as DropdownMenuCreateHandle,
  Menu as DropdownMenu,
  MenuPortal as DropdownMenuPortal,
  MenuTrigger as DropdownMenuTrigger,
  MenuPopup as DropdownMenuContent,
  MenuGroup as DropdownMenuGroup,
  MenuItem as DropdownMenuItem,
  MenuCheckboxItem as DropdownMenuCheckboxItem,
  MenuRadioGroup as DropdownMenuRadioGroup,
  MenuRadioItem as DropdownMenuRadioItem,
  MenuGroupLabel as DropdownMenuLabel,
  MenuSeparator as DropdownMenuSeparator,
  MenuShortcut as DropdownMenuShortcut,
  MenuSub as DropdownMenuSub,
  MenuSubTrigger as DropdownMenuSubTrigger,
  MenuSubPopup as DropdownMenuSubContent,
}
