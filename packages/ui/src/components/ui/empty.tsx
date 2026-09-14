import * as stylex from "@stylexjs/stylex"
import type React from "react"
import { cn } from "@/lib/utils"
import type { Sx } from "../../styles/sx"
import { colors, font, radius, shadows, text } from "../../styles/tokens.stylex"

export type EmptyMediaVariant = "default" | "icon"

const styles = stylex.create({
  empty: {
    gap: "1.5rem",
    paddingBlock: {
      default: "3rem",
      "@media (width >= 48rem)": "5rem",
    },
    paddingInline: "1.5rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "center",
    textAlign: "center",
    textWrap: "balance",
    minWidth: 0,
  },
  header: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    maxWidth: "24rem",
  },
  media: {
    position: "relative",
    marginBottom: "1.5rem",
  },
  mediaInner: {
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
  },
  // The icon variant is a small raised card, stacked with two rotated
  // shadows behind it to read as a deck.
  mediaIcon: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    color: colors.foreground,
    position: "relative",
    height: "2.25rem",
    width: "2.25rem",
    "::before": {
      inset: 0,
      borderRadius: "inherit",
      boxShadow: shadows.edge,
      content: '""',
      pointerEvents: "none",
      position: "absolute",
    },
  },
  mediaGhost: {
    boxShadow: "none",
    pointerEvents: "none",
    position: "absolute",
    bottom: "1px",
  },
  mediaGhostLeft: {
    rotate: "-10deg",
    scale: "0.84",
    transformOrigin: "bottom left",
    translate: "-0.125rem",
  },
  mediaGhostRight: {
    rotate: "10deg",
    scale: "0.84",
    transformOrigin: "bottom right",
    translate: "0.125rem",
  },
  title: {
    fontFamily: font.heading,
    fontSize: text.xl,
    fontWeight: 600,
  },
  description: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  content: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    textWrap: "balance",
    maxWidth: "24rem",
    minWidth: 0,
    width: "100%",
  },
})

export function Empty({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.empty, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-slot="empty"
      style={styleProps.style}
      {...props}
    />
  )
}

export function EmptyHeader({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.header, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-slot="empty-header"
      style={styleProps.style}
      {...props}
    />
  )
}

export function EmptyMedia({
  className,
  variant = "default",
  sx,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: EmptyMediaVariant
  sx?: Sx
}): React.ReactElement {
  const wrapperProps = stylex.props(styles.media, sx)
  const innerProps = stylex.props(styles.mediaInner, variant === "icon" && styles.mediaIcon)
  const ghostLeftProps = stylex.props(
    styles.mediaInner,
    styles.mediaIcon,
    styles.mediaGhost,
    styles.mediaGhostLeft,
  )
  const ghostRightProps = stylex.props(
    styles.mediaInner,
    styles.mediaIcon,
    styles.mediaGhost,
    styles.mediaGhostRight,
  )

  return (
    <div
      className={cn(wrapperProps.className, className)}
      data-slot="empty-media"
      data-variant={variant}
      style={wrapperProps.style}
    >
      {variant === "icon" && (
        <>
          <div
            aria-hidden="true"
            className={ghostLeftProps.className}
            style={ghostLeftProps.style}
          />
          <div
            aria-hidden="true"
            className={ghostRightProps.className}
            style={ghostRightProps.style}
          />
        </>
      )}
      <div className={innerProps.className} style={innerProps.style} {...props} />
    </div>
  )
}

export function EmptyTitle({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.title, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-slot="empty-title"
      style={styleProps.style}
      {...props}
    />
  )
}

export function EmptyDescription({
  className,
  sx,
  ...props
}: React.ComponentProps<"p"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.description, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-slot="empty-description"
      style={styleProps.style}
      {...props}
    />
  )
}

export function EmptyContent({
  className,
  sx,
  ...props
}: React.ComponentProps<"div"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(styles.content, sx)

  return (
    <div
      className={cn(styleProps.className, className)}
      data-slot="empty-content"
      style={styleProps.style}
      {...props}
    />
  )
}
