"use client"

import * as stylex from "@stylexjs/stylex"
import type * as React from "react"
import { cn } from "@/utils/cn"
import { Input, type InputProps } from "@/components/ui/input"
import { Textarea, type TextareaProps } from "@/components/ui/textarea"
import type { Sx } from "../../styles/sx"
import { colors, consts, radius, shadows } from "../../styles/tokens.stylex"
import { focus } from "../../styles/recipes"

export type InputGroupAddonAlign = "block-end" | "block-start" | "inline-end" | "inline-start"

const styles = stylex.create({
  group: {
    borderColor: {
      default: colors.input,
      ":focus-within": colors.ring,
    },
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "center",
    backgroundClip: "padding-box",
    backgroundColor: colors.field,
    boxShadow: {
      default: shadows.chip,
      ":focus-within": "none",
    },
    color: colors.foreground,
    display: "inline-flex",
    fontSize: {
      default: "1rem",
      [consts.sm]: "0.875rem",
    },
    position: "relative",
    transitionProperty: "box-shadow, border-color",
    minWidth: 0,
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
  addon: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    cursor: "text",
    display: "flex",
    justifyContent: "center",
    lineHeight: 1,
    userSelect: "none",
    height: "auto",
  },
  addonBlockEnd: {
    paddingInline: "calc(0.75rem - 1px)",
    justifyContent: "flex-start",
    order: 1,
    paddingBottom: "calc(0.75rem - 1px)",
    width: "100%",
  },
  addonBlockStart: {
    paddingInline: "calc(0.75rem - 1px)",
    justifyContent: "flex-start",
    order: -1,
    paddingTop: "calc(0.75rem - 1px)",
    width: "100%",
  },
  addonInlineEnd: {
    order: 1,
    paddingRight: "calc(0.75rem - 1px)",
  },
  addonInlineStart: {
    order: -1,
    paddingLeft: "calc(0.75rem - 1px)",
  },
  text: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    lineHeight: 1,
    whiteSpace: "nowrap",
  },
})
const ALIGN_STYLE = {
  "block-end": styles.addonBlockEnd,
  "block-start": styles.addonBlockStart,
  "inline-end": styles.addonInlineEnd,
  "inline-start": styles.addonInlineStart,
} as const

export function InputGroup({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(focus.field, styles.group, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-slot="input-group"
      role="group"
      style={styleProps.style}
      {...props}
    />
  )
}

export function InputGroupAddon({
  className,
  align = "inline-start",
  sx,
  ...props
}: React.ComponentProps<"div"> & {
  align?: InputGroupAddonAlign
  sx?: Sx
}): React.ReactElement {
  const styleProps = stylex.props(styles.addon, ALIGN_STYLE[align], sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-align={align}
      data-slot="input-group-addon"
      onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement
        const isInteractive = target.closest(
          "button, a, input, select, textarea, [role='button'], [role='combobox'], [role='listbox'], [data-slot='select-trigger']",
        )

        if (isInteractive) {
          return
        }

        e.preventDefault()
        const parent = e.currentTarget.parentElement
        const input = parent?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
          "input, textarea",
        )

        if (input && !parent?.querySelector("input:focus, textarea:focus")) {
          input.focus()
        }
      }}
      style={styleProps.style}
      {...props}
    />
  )
}

export function InputGroupText({
  className,
  sx,
  ...props
}: React.ComponentProps<"span"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.text, sx)

  return (
    <span className={cn(styleProps.className, className)} style={styleProps.style} {...props} />
  )
}

export function InputGroupInput({ className, ...props }: InputProps): React.ReactElement {
  return <Input className={className} unstyled {...props} />
}

export function InputGroupTextarea({ className, ...props }: TextareaProps): React.ReactElement {
  return <Textarea className={className} unstyled {...props} />
}
