import type React from "react"
import * as stylex from "@stylexjs/stylex"
import type { Sx } from "../../styles/sx"
import { palette } from "../../styles/palette.stylex"
import { surface } from "../../styles/recipes"
import {
  breakpoints,
  colors,
  consts,
  font,
  radius,
  shadows,
  text,
} from "../../styles/tokens.stylex"
import { cn } from "../../utils/cn"

export type EmptyMediaVariant = "default" | "icon"

const SPARKLES = [
  { size: 16, left: "1.25rem", top: "0.5rem", delay: "0s" },
  { size: 11, left: "12rem", top: "1.75rem", delay: "-0.8s" },
  { size: 13, left: "11rem", top: "6.5rem", delay: "-1.6s" },
  { size: 9, left: "2.25rem", top: "6.25rem", delay: "-0.4s" },
]
const bob = stylex.keyframes({
  "0%, 100%": { transform: "translateY(0)" },
  "50%": { transform: "translateY(-6px)" },
})
const twinkle = stylex.keyframes({
  "0%, 100%": { opacity: 0.25, transform: "scale(0.6) rotate(0deg)" },
  "50%": { opacity: 1, transform: "scale(1) rotate(20deg)" },
})
const styles = stylex.create({
  empty: {
    gap: "1.5rem",
    paddingBlock: {
      default: "3rem",
      [breakpoints.md]: "5rem",
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
  pages: {
    position: "relative",
    height: "8.5rem",
    marginBottom: "0.5rem",
    width: "14rem",
  },
  stack: {
    inset: 0,
    animationDuration: "5s",
    animationIterationCount: {
      default: "infinite",
      [consts.reducedMotion]: 0,
    },
    animationName: bob,
    animationTimingFunction: "ease-in-out",
    position: "absolute",
  },
  page: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    position: "absolute",
    transformOrigin: "bottom center",
    height: "6.25rem",
    left: "calc(50% - 2.25rem)",
    top: "0.75rem",
    width: "4.5rem",
  },
  pageBack: {
    padding: "calc(0.375rem - 1px)",
    gap: "0.25rem",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridTemplateRows: "1.25fr 1fr 1fr",
    pointerEvents: "none",
  },
  pageLeft: {
    rotate: "-14deg",
    translate: "-1.5rem 0.5rem",
  },
  pageRight: {
    rotate: "14deg",
    translate: "1.5rem 0.5rem",
  },
  pageFront: {
    alignItems: "center",
    backgroundImage: `linear-gradient(160deg, color-mix(in srgb, ${colors.primary} 22%, ${colors.card}), ${colors.card})`,
    color: colors.primary,
    display: "flex",
    justifyContent: "center",
  },
  panel: {
    borderRadius: `calc(${radius.md} - 0.375rem)`,
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
  },
  panelWide: {
    gridColumnEnd: -1,
    gridColumnStart: 1,
  },
  sparkle: {
    animationDuration: "2.4s",
    animationIterationCount: {
      default: "infinite",
      [consts.reducedMotion]: 0,
    },
    animationName: twinkle,
    animationTimingFunction: "ease-in-out",
    color: palette.amber400,
    pointerEvents: "none",
    position: "absolute",
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

function PagePanels() {
  return (
    <>
      <span sx={[styles.panel, styles.panelWide]} />
      <span sx={styles.panel} />
      <span sx={styles.panel} />
      <span sx={[styles.panel, styles.panelWide]} />
    </>
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
  const wrapperProps = stylex.props(styles.media, variant === "icon" && styles.pages, sx)

  if (variant !== "icon") {
    const innerProps = stylex.props(styles.mediaInner)

    return (
      <div
        className={cn(wrapperProps.className, className)}
        data-slot="empty-media"
        data-variant={variant}
        style={wrapperProps.style}
      >
        <div className={innerProps.className} style={innerProps.style} {...props} />
      </div>
    )
  }

  const frontProps = stylex.props(surface.raisedEdge, styles.page, styles.pageFront)

  return (
    <div
      className={cn(wrapperProps.className, className)}
      data-slot="empty-media"
      data-variant={variant}
      style={wrapperProps.style}
    >
      <div sx={styles.stack}>
        <div
          aria-hidden="true"
          sx={[surface.raisedEdge, styles.page, styles.pageBack, styles.pageLeft]}
        >
          <PagePanels />
        </div>
        <div
          aria-hidden="true"
          sx={[surface.raisedEdge, styles.page, styles.pageBack, styles.pageRight]}
        >
          <PagePanels />
        </div>
        <div className={frontProps.className} style={frontProps.style} {...props} />
      </div>
      {SPARKLES.map((sparkle) => (
        <svg
          aria-hidden="true"
          height={sparkle.size}
          key={sparkle.left}
          style={{ animationDelay: sparkle.delay, left: sparkle.left, top: sparkle.top }}
          sx={styles.sparkle}
          viewBox="0 0 24 24"
          width={sparkle.size}
        >
          <path
            d="M12 0c.8 6.4 5.6 11.2 12 12-6.4.8-11.2 5.6-12 12-.8-6.4-5.6-11.2-12-12C6.4 11.2 11.2 6.4 12 0z"
            fill="currentColor"
          />
        </svg>
      ))}
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
