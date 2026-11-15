import type * as React from "react"
import * as stylex from "@stylexjs/stylex"
import type { Sx } from "../../styles/sx"
import { surface } from "../../styles/recipes"
import { colors, radius, shadows } from "../../styles/tokens.stylex"
import { cn } from "../../utils/cn"

const styles = stylex.create({
  frame: {
    padding: "0.25rem",
    borderRadius: radius.xxl,
    backgroundColor: `color-mix(in srgb, ${colors.muted} 72%, transparent)`,
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  panel: {
    padding: "1.25rem",
    borderColor: colors.border,
    borderRadius: `calc(${radius.xxl} - 0.25rem)`,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    position: "relative",
  },
  header: {
    paddingBlock: "1rem",
    paddingInline: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: "0.875rem",
    fontWeight: 600,
    lineHeight: "1.25rem",
  },
  description: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  footer: {
    paddingBlock: "1rem",
    paddingInline: "1.25rem",
  },
})

export function Frame({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.frame, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-slot="frame"
      style={styleProps.style}
      {...props}
    />
  )
}

export function FramePanel({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(surface.raisedEdge, styles.panel, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-slot="frame-panel"
      style={styleProps.style}
      {...props}
    />
  )
}

export function FrameHeader({
  className,
  sx,
  ...props
}: React.ComponentProps<"header"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.header, sx)

  return (
    <header
      className={cn(styleProps.className, className)}
      data-slot="frame-panel-header"
      style={styleProps.style}
      {...props}
    />
  )
}

export function FrameTitle({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.title, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-slot="frame-panel-title"
      style={styleProps.style}
      {...props}
    />
  )
}

export function FrameDescription({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.description, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-slot="frame-panel-description"
      style={styleProps.style}
      {...props}
    />
  )
}

export function FrameFooter({
  className,
  sx,
  ...props
}: React.ComponentProps<"footer"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.footer, sx)

  return (
    <footer
      className={cn(styleProps.className, className)}
      data-slot="frame-panel-footer"
      style={styleProps.style}
      {...props}
    />
  )
}
