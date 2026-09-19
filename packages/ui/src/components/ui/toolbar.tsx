"use client"

import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar"
import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/utils/cn"
import type { Sx } from "../../styles/sx"
import { colors, radius } from "../../styles/tokens.stylex"

const styles = stylex.create({
  root: {
    padding: "0.25rem",
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.5rem",
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    color: colors.cardForeground,
    display: "flex",
    position: "relative",
  },
  group: {
    gap: "0.25rem",
    alignItems: "center",
    display: "flex",
  },
  separator: {
    marginBlock: {
      '[data-orientation="horizontal"]': "0.125rem",
      '[data-orientation="vertical"]': "0.375rem",
      default: null,
    },
    alignSelf: {
      '[data-orientation="vertical"]': "stretch",
      default: null,
    },
    backgroundColor: colors.border,
    flexShrink: 0,
    height: {
      '[data-orientation="horizontal"]': "1px",
      default: null,
    },
    width: {
      '[data-orientation="horizontal"]': "100%",
      '[data-orientation="vertical"]': "1px",
      default: null,
    },
  },
})

export function Toolbar({
  className,
  sx,
  ...props
}: ToolbarPrimitive.Root.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.root, sx)

  return (
    <ToolbarPrimitive.Root
      className={cn(styleProps.className, className)}
      data-slot="toolbar"
      style={styleProps.style}
      {...props}
    />
  )
}

export function ToolbarButton({
  className,
  sx,
  ...props
}: ToolbarPrimitive.Button.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(sx)

  return (
    <ToolbarPrimitive.Button
      className={cn(styleProps.className, className)}
      data-slot="toolbar-button"
      style={styleProps.style}
      {...props}
    />
  )
}

export function ToolbarLink({
  className,
  sx,
  ...props
}: ToolbarPrimitive.Link.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(sx)

  return (
    <ToolbarPrimitive.Link
      className={cn(styleProps.className, className)}
      data-slot="toolbar-link"
      style={styleProps.style}
      {...props}
    />
  )
}

export function ToolbarInput({
  className,
  sx,
  ...props
}: ToolbarPrimitive.Input.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(sx)

  return (
    <ToolbarPrimitive.Input
      className={cn(styleProps.className, className)}
      data-slot="toolbar-input"
      style={styleProps.style}
      {...props}
    />
  )
}

export function ToolbarGroup({
  className,
  sx,
  ...props
}: ToolbarPrimitive.Group.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.group, sx)

  return (
    <ToolbarPrimitive.Group
      className={cn(styleProps.className, className)}
      data-slot="toolbar-group"
      style={styleProps.style}
      {...props}
    />
  )
}

export function ToolbarSeparator({
  className,
  sx,
  ...props
}: ToolbarPrimitive.Separator.Props & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.separator, sx)

  return (
    <ToolbarPrimitive.Separator
      className={cn(styleProps.className, className)}
      data-slot="toolbar-separator"
      style={styleProps.style}
      {...props}
    />
  )
}

export { ToolbarPrimitive }
