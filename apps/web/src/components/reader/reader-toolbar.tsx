import * as stylex from "@stylexjs/stylex"
import { Link } from "@tanstack/react-router"
import { ChevronLeft, ChevronRight, Close } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Progress } from "@taiyomoe/ui/components/ui/progress"
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarLink,
  ToolbarSeparator,
} from "@taiyomoe/ui/components/ui/toolbar"
import { colors, consts, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ReactNode } from "react"

import { m } from "@/paraglide/messages"

type ChapterLink = { id: string } | null

const styles = stylex.create({
  dock: {
    insetInline: 0,
    paddingInline: "0.75rem",
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none",
    position: "fixed",
    zIndex: 20,
    top: "0.75rem",
  },
  toolbar: {
    borderRadius: radius.full,
    paddingInline: "0.5rem",
    alignItems: "center",
    backdropFilter: "blur(16px)",
    backgroundColor: `color-mix(in srgb, ${colors.popover} 88%, transparent)`,
    boxShadow: shadows.overlay,
    opacity: { "[data-hidden]": 0, default: 1 },
    pointerEvents: "auto",
    transform: { "[data-hidden]": "translateY(calc(-100% - 1rem))", default: "none" },
    transitionDuration: "250ms",
    transitionProperty: "transform, opacity",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    maxWidth: "48rem",
    width: "100%",
  },
  heading: {
    flex: "1",
    gap: "0.0625rem",
    paddingInline: "0.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  mediaTitle: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chapterTitle: {
    overflow: "hidden",
    fontSize: "0.875rem",
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  progress: {
    gap: "0.625rem",
    alignItems: "center",
    display: { default: "none", [consts.sm]: "flex" },
  },
  progressBar: {
    width: "6rem",
  },
  progressLabel: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
})

function ChapterButton({
  mediaId,
  chapter,
  label,
  children,
}: {
  mediaId: string
  chapter: ChapterLink
  label: string
  children: ReactNode
}) {
  if (!chapter) {
    return (
      <ToolbarButton aria-label={label} disabled render={<Button size="icon" variant="ghost" />}>
        {children}
      </ToolbarButton>
    )
  }

  return (
    <ToolbarLink
      aria-label={label}
      render={
        <Button
          render={
            <Link params={{ mediaId, chapterId: chapter.id }} to="/read/$mediaId/$chapterId" />
          }
          size="icon"
          variant="ghost"
        />
      }
    >
      {children}
    </ToolbarLink>
  )
}

export function ReaderToolbar({
  hidden,
  mediaId,
  mediaTitle,
  chapterHeading,
  current,
  total,
  previous,
  next,
}: {
  hidden: boolean
  mediaId: string
  mediaTitle: string
  chapterHeading: string
  current: number
  total: number
  previous: ChapterLink
  next: ChapterLink
}) {
  return (
    <div sx={styles.dock}>
      <Toolbar data-hidden={hidden || undefined} sx={styles.toolbar}>
        <ToolbarLink
          aria-label={m.reader_back()}
          render={
            <Button
              render={<Link params={{ mediaId }} to="/titles/$mediaId" />}
              size="icon"
              variant="ghost"
            />
          }
        >
          <Close />
        </ToolbarLink>
        <div sx={styles.heading}>
          <span sx={styles.mediaTitle}>{mediaTitle}</span>
          <span sx={styles.chapterTitle}>{chapterHeading}</span>
        </div>
        {total > 0 ? (
          <div sx={styles.progress}>
            <Progress
              aria-label={m.reader_page_progress({ current: current + 1, total })}
              sx={styles.progressBar}
              value={((current + 1) / total) * 100}
            />
            <span sx={styles.progressLabel}>
              {m.reader_page_progress({ current: current + 1, total })}
            </span>
          </div>
        ) : null}
        <ToolbarSeparator orientation="vertical" />
        <ToolbarGroup>
          <ChapterButton chapter={previous} mediaId={mediaId} label={m.reader_previous_chapter()}>
            <ChevronLeft />
          </ChapterButton>
          <ChapterButton chapter={next} mediaId={mediaId} label={m.reader_next_chapter()}>
            <ChevronRight />
          </ChapterButton>
        </ToolbarGroup>
      </Toolbar>
    </div>
  )
}
