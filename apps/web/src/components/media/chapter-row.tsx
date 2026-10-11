import * as stylex from "@stylexjs/stylex"
import { Link } from "@tanstack/react-router"
import { ChevronRight } from "@taiyomoe/ui/components/icons"
import { focus, surface } from "@taiyomoe/ui/styles/recipes"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ReactNode } from "react"

import { type ChapterLabelInput, getChapterLabel } from "@/components/media/chapter-label"

const LIST_PADDING = "0.375rem"
const styles = stylex.create({
  list: {
    margin: 0,
    padding: LIST_PADDING,
    borderRadius: radius.xxl,
    gap: "0.125rem",
    listStyle: "none",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  row: {
    borderRadius: `calc(${radius.xxl} - ${LIST_PADDING})`,
    gap: "1rem",
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
    textDecoration: "none",
    alignItems: "center",
    backgroundColor: { default: "transparent", ":hover": colors.accent },
    color: colors.foreground,
    display: "flex",
    transitionDuration: "150ms",
    transitionProperty: "background-color",
    minHeight: "3.5rem",
  },
  text: {
    flex: "1",
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  eyebrow: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  heading: {
    gap: "0.5rem",
    alignItems: "baseline",
    display: "flex",
    minWidth: 0,
  },
  number: {
    fontSize: "0.9375rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  title: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  language: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    whiteSpace: "nowrap",
  },
  chevron: {
    color: colors.mutedForeground,
    flexShrink: 0,
    opacity: 0.6,
    height: "1rem",
    width: "1rem",
  },
})

export type ChapterRowChapter = ChapterLabelInput & { id: string }

export function ChapterList({ children }: { children: ReactNode }) {
  return <ul sx={[surface.raisedEdge, styles.list]}>{children}</ul>
}

export function ChapterRow({
  chapter,
  mediaId,
  mediaTitle,
}: {
  chapter: ChapterRowChapter
  mediaId: string
  mediaTitle?: string | null
}) {
  const label = getChapterLabel(chapter)

  return (
    <li>
      <Link
        params={{ mediaId, chapterId: chapter.id }}
        to="/read/$mediaId/$chapterId"
        {...stylex.props(styles.row, focus.control)}
      >
        <span sx={styles.text}>
          {mediaTitle ? <span sx={styles.eyebrow}>{mediaTitle}</span> : null}
          <span sx={styles.heading}>
            <span sx={styles.number}>{label.heading}</span>
            {label.title ? <span sx={styles.title}>{label.title}</span> : null}
          </span>
        </span>
        <span sx={styles.language}>{label.language}</span>
        <ChevronRight {...stylex.props(styles.chevron)} />
      </Link>
    </li>
  )
}
