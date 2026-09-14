import * as stylex from "@stylexjs/stylex"
import type * as React from "react"
import { cn } from "@/lib/utils"
import type { Sx } from "../../styles/sx"
import { colors, radius, shadows } from "../../styles/tokens.stylex"

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
    // Concentric with the frame: the frame is radius.xxl and pads 0.25rem.
    borderRadius: `calc(${radius.xxl} - 0.25rem)`,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    // The panel is the raised surface sitting in the frame's wash, so it takes
    // the card colour; `background` made it the same value as the page behind.
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    position: "relative",
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: shadows.edge,
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
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
  const styleProps = stylex.props(styles.panel, sx)

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
