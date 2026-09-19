"use client"

import { Dialog as CommandDialogPrimitive } from "@base-ui/react/dialog"
import * as stylex from "@stylexjs/stylex"
import type * as React from "react"
import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteSeparator,
} from "@/components/ui/autocomplete"
import { cn } from "@/utils/cn"
import { Search } from "@/components/icons"
import type { Sx } from "../../styles/sx"
import { colors, consts, font, radius, shadows } from "../../styles/tokens.stylex"

export const CommandDialog: typeof CommandDialogPrimitive.Root = CommandDialogPrimitive.Root

export const CommandDialogPortal: typeof CommandDialogPrimitive.Portal =
  CommandDialogPrimitive.Portal

export const CommandCreateHandle: typeof CommandDialogPrimitive.createHandle =
  CommandDialogPrimitive.createHandle

const styles = stylex.create({
  backdrop: {
    inset: 0,
    backdropFilter: "blur(4px)",
    backgroundColor: "rgb(0 0 0 / 32%)",
    opacity: {
      "[data-ending-style]": 0,
      "[data-starting-style]": 0,
      default: null,
    },
    position: "fixed",
    transitionDuration: "200ms",
    transitionProperty: "all",
    zIndex: 50,
  },
  viewport: {
    inset: 0,
    paddingBlock: {
      default: "max(1rem, 4vh)",
      [consts.sm]: "10vh",
    },
    paddingInline: "1rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    zIndex: 50,
  },
  popup: {
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.popover,
    boxShadow: shadows.overlay,
    color: colors.popoverForeground,
    display: "flex",
    flexDirection: "column",
    opacity: {
      "[data-ending-style]": 0,
      "[data-starting-style]": 0,
      default: "calc(1 - 0.1 * var(--nested-dialogs))",
    },
    outlineStyle: "none",
    position: "relative",
    scale: {
      "[data-ending-style]": "0.98",
      "[data-starting-style]": "0.98",
      default: "calc(1 - 0.1 * var(--nested-dialogs))",
    },
    transformOrigin: {
      "[data-nested-dialog-open]": "top",
      default: null,
    },
    transitionDuration: "200ms",
    transitionProperty: "scale, opacity, translate",
    transitionTimingFunction: "ease-in-out",
    translate: "0 calc(-1.25rem * var(--nested-dialogs))",
    willChange: "transform",
    maxHeight: "26.25rem",
    maxWidth: "36rem",
    minHeight: 0,
    minWidth: 0,
    width: "100%",
    // The muted wash behind the panel is what separates the search row from
    // the results surface.
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      backgroundColor: `color-mix(in srgb, ${colors.muted} 72%, transparent)`,
      boxShadow: shadows.edge,
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
  inputRow: {
    paddingBlock: "0.375rem",
    paddingInline: "0.625rem",
    position: "relative",
  },
  input: {
    borderColor: "transparent",
    backgroundColor: "transparent",
    boxShadow: "none",
    outlineStyle: "none",
    "::before": {
      display: "none",
    },
  },
  list: {
    padding: {
      default: "0.5rem",
      ":empty": 0,
    },
    scrollPaddingBottom: "0.5rem",
    scrollPaddingTop: "0.5rem",
  },
  empty: {
    paddingBlock: {
      default: "1.5rem",
      ":empty": 0,
    },
  },
  panel: {
    borderColor: colors.border,
    borderStyle: "solid",
    borderWidth: 1,
    marginInline: "-1px",
    backgroundClip: "padding-box",
    backgroundColor: colors.popover,
    borderStartEndRadius: radius.xl,
    borderStartStartRadius: radius.xl,
    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 5%)",
    clipPath: "inset(0 1px)",
    position: "relative",
    borderBottomWidth: 0,
    minHeight: 0,
    "::before": {
      inset: 0,
      borderStartEndRadius: "calc(1.225rem - 1px)",
      borderStartStartRadius: "calc(1.225rem - 1px)",
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
  item: {
    // The command list is padded 0.5rem inside a radius.xl panel, so the row's
    // corners must be concentric with that, not with the 0.25rem-padded lists
    // the autocomplete item style is tuned for.
    borderRadius: `calc(${radius.xl} - 0.5rem)`,
    gap: "0.5rem",
    paddingBlock: "0.375rem",
    display: "inline-flex",
    width: "100%",
  },
  separator: {
    marginBlock: "0.5rem",
  },
  shortcut: {
    color: `color-mix(in srgb, ${colors.mutedForeground} 72%, transparent)`,
    fontFamily: font.sans,
    fontSize: "0.75rem",
    fontWeight: 500,
    letterSpacing: "0.1em",
    lineHeight: "1rem",
    marginLeft: "auto",
  },
  footer: {
    gap: "0.5rem",
    paddingBlock: "0.75rem",
    paddingInline: "1.25rem",
    alignItems: "center",
    borderEndEndRadius: "calc(1.575rem - 1px)",
    borderEndStartRadius: "calc(1.575rem - 1px)",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.75rem",
    justifyContent: "space-between",
    lineHeight: "1rem",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
})

export function CommandDialogTrigger(
  props: CommandDialogPrimitive.Trigger.Props,
): React.ReactElement {
  return <CommandDialogPrimitive.Trigger data-slot="command-dialog-trigger" {...props} />
}

export function CommandDialogBackdrop({
  className,
  sx,
  ...props
}: CommandDialogPrimitive.Backdrop.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.backdrop, sx)

  return (
    <CommandDialogPrimitive.Backdrop
      className={cn(styleProps.className, className)}
      data-slot="command-dialog-backdrop"
      style={styleProps.style}
      {...props}
    />
  )
}

export function CommandDialogViewport({
  className,
  sx,
  ...props
}: CommandDialogPrimitive.Viewport.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.viewport, sx)

  return (
    <CommandDialogPrimitive.Viewport
      className={cn(styleProps.className, className)}
      data-slot="command-dialog-viewport"
      style={styleProps.style}
      {...props}
    />
  )
}

export function CommandDialogPopup({
  className,
  children,
  portalProps,
  sx,
  ...props
}: CommandDialogPrimitive.Popup.Props & {
  portalProps?: CommandDialogPrimitive.Portal.Props
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.popup, sx)

  return (
    <CommandDialogPortal {...portalProps}>
      <CommandDialogBackdrop />
      <CommandDialogViewport>
        <CommandDialogPrimitive.Popup
          className={cn(styleProps.className, className)}
          data-slot="command-dialog-popup"
          style={styleProps.style}
          {...props}
        >
          {children}
        </CommandDialogPrimitive.Popup>
      </CommandDialogViewport>
    </CommandDialogPortal>
  )
}

export function Command({
  autoHighlight = "always",
  keepHighlight = true,
  ...props
}: React.ComponentProps<typeof Autocomplete>): React.ReactElement {
  return (
    <Autocomplete
      autoHighlight={autoHighlight}
      inline
      keepHighlight={keepHighlight}
      open
      {...props}
    />
  )
}

export function CommandInput({
  className,
  placeholder,
  sx,
  ...props
}: React.ComponentProps<typeof AutocompleteInput> & { sx?: Sx }): React.ReactElement {
  const rowProps = stylex.props(styles.inputRow)

  return (
    <div className={rowProps.className} style={rowProps.style}>
      <AutocompleteInput
        autoFocus
        className={className}
        placeholder={placeholder}
        size="lg"
        startAddon={<Search />}
        sx={[styles.input, sx]}
        {...props}
      />
    </div>
  )
}

export function CommandList({
  className,
  sx,
  ...props
}: React.ComponentProps<typeof AutocompleteList> & { sx?: Sx }): React.ReactElement {
  return (
    <AutocompleteList
      className={className}
      data-slot="command-list"
      sx={[styles.list, sx]}
      {...props}
    />
  )
}

export function CommandEmpty({
  className,
  sx,
  ...props
}: React.ComponentProps<typeof AutocompleteEmpty> & { sx?: Sx }): React.ReactElement {
  return (
    <AutocompleteEmpty
      className={className}
      data-slot="command-empty"
      sx={[styles.empty, sx]}
      {...props}
    />
  )
}

export function CommandPanel({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.panel, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-slot="command-panel"
      style={styleProps.style}
      {...props}
    />
  )
}

export function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteGroup>): React.ReactElement {
  return <AutocompleteGroup className={className} data-slot="command-group" {...props} />
}

export function CommandGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteGroupLabel>): React.ReactElement {
  return <AutocompleteGroupLabel className={className} data-slot="command-group-label" {...props} />
}

export function CommandCollection({
  ...props
}: React.ComponentProps<typeof AutocompleteCollection>): React.ReactElement {
  return <AutocompleteCollection data-slot="command-collection" {...props} />
}

export function CommandItem({
  className,
  sx,
  ...props
}: React.ComponentProps<typeof AutocompleteItem> & { sx?: Sx }): React.ReactElement {
  return (
    <AutocompleteItem
      className={className}
      data-slot="command-item"
      sx={[styles.item, sx]}
      {...props}
    />
  )
}

export function CommandSeparator({
  className,
  sx,
  ...props
}: React.ComponentProps<typeof AutocompleteSeparator> & { sx?: Sx }): React.ReactElement {
  return (
    <AutocompleteSeparator
      className={className}
      data-slot="command-separator"
      sx={[styles.separator, sx]}
      {...props}
    />
  )
}

export function CommandShortcut({
  className,
  sx,
  ...props
}: React.ComponentProps<"kbd"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.shortcut, sx)

  return (
    <kbd
      className={cn(styleProps.className, className)}
      data-slot="command-shortcut"
      style={styleProps.style}
      {...props}
    />
  )
}

export function CommandFooter({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.footer, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-slot="command-footer"
      style={styleProps.style}
      {...props}
    />
  )
}

export { CommandDialogPrimitive }
