import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { EditorTitle } from "@/features/lists/lib/list-editor"
import { Cover } from "@/features/media/components/cover"
import { MEDIA_TYPE_LABELS } from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  coverWrap: {
    display: "block",
    position: "relative",
  },
  cover: {
    width: "100%",
  },
  position: {
    borderRadius: radius.full,
    paddingInline: "0.5rem",
    backdropFilter: "blur(8px)",
    backgroundColor: `color-mix(in srgb, ${colors.background} 78%, transparent)`,
    color: colors.foreground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    lineHeight: "1.375rem",
    position: "absolute",
    zIndex: 1,
    left: "0.5rem",
    top: "0.5rem",
  },
  title: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    display: "-webkit-box",
    fontSize: "0.9375rem",
    fontWeight: 600,
    lineHeight: 1.3,
    overflowWrap: "anywhere",
  },
  untitled: {
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
  type: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
})

export const listTitleCardStyles = stylex.create({
  grid: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    columnGap: { default: "0.75rem", [breakpoints.sm]: "1rem" },
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(auto-fill, minmax(6.5rem, 1fr))",
      [breakpoints.sm]: "repeat(auto-fill, minmax(9.5rem, 1fr))",
    },
    rowGap: { default: "1.25rem", [breakpoints.sm]: "1.5rem" },
  },
  card: {
    borderRadius: radius.lg,
    gap: "0.5rem",
    textDecoration: "none",
    color: "inherit",
    display: "flex",
    flexDirection: "column",
    outlineColor: colors.ring,
    outlineOffset: 3,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    minWidth: 0,
  },
})

export function ListTitleCardBody({
  title,
  position,
  overlay,
  eager = false,
}: {
  title: EditorTitle
  position: number
  overlay?: ReactNode
  eager?: boolean
}) {
  return (
    <>
      <span sx={styles.coverWrap}>
        <span sx={styles.position}>{position}</span>
        <Cover
          alt={title.title ?? ""}
          priority={eager ? "high" : "auto"}
          src={title.coverUrl}
          sx={styles.cover}
        />
        {overlay}
      </span>
      <span sx={[styles.title, title.title === null && styles.untitled]}>
        {title.title ?? m.media_untitled()}
      </span>
      <span sx={styles.type}>{MEDIA_TYPE_LABELS[title.type]()}</span>
    </>
  )
}
