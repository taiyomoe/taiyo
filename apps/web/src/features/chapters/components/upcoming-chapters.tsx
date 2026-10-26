import * as stylex from "@stylexjs/stylex"
import { CalendarClock, Globe } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useDeferredValue, useState } from "react"
import type { Session } from "@/lib/session"
import { LanguageFlag } from "@/components/flags/flags"
import { upcomingChaptersQueryOptions } from "@/features/chapters/api/chapters"
import {
  ChapterGroups,
  TimeAgo,
  getChapterLabel,
} from "@/features/chapters/components/chapter-meta"
import { ScheduleActions } from "@/features/chapters/components/schedule-actions"
import { usePermissions } from "@/lib/permissions"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const DESKTOP = "@media (width >= 48rem)"
const COLLAPSED_ROWS = 3
const styles = stylex.create({
  card: {
    padding: { [DESKTOP]: "0.875rem", default: "0.625rem" },
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  header: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    paddingBottom: "0.625rem",
  },
  headerIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  headerText: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  title: {
    margin: 0,
    color: colors.foreground,
    fontFamily: font.heading,
    fontSize: { [DESKTOP]: "1.125rem", default: "1rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
  },
  description: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
  count: {
    color: colors.mutedForeground,
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.75rem",
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  row: {
    paddingBlock: "0.625rem",
    alignItems: "center",
    columnGap: "1.5rem",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    rowGap: "0.375rem",
    borderTopColor: { default: colors.border, ":first-child": "transparent" },
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  label: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    fontSize: "0.875rem",
    fontWeight: 600,
    minWidth: 0,
  },
  labelText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chapterTitle: {
    color: `color-mix(in srgb, ${colors.foreground} 72%, transparent)`,
    fontWeight: 500,
  },
  external: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  time: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    justifySelf: "end",
  },
  timeIcon: {
    flexShrink: 0,
  },
  actions: {
    gap: "0.25rem",
    display: "flex",
    justifySelf: "end",
  },
  more: {
    alignSelf: "center",
  },
})

export function UpcomingChapters({
  mediaId,
  user,
}: {
  mediaId: string
  user: Session["user"] | null
}) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data = [] } = useQuery(upcomingChaptersQueryOptions({ contentRatings, mediaId }))
  const can = usePermissions(user)
  const [expanded, setExpanded] = useState(false)
  const hidden = expanded ? 0 : Math.max(data.length - COLLAPSED_ROWS, 0)

  if (data.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="media-upcoming-title" sx={styles.card}>
      <div sx={styles.header}>
        <CalendarClock size={18} {...stylex.props(styles.headerIcon)} />
        <div sx={styles.headerText}>
          <h3 id="media-upcoming-title" sx={styles.title}>
            {m.media_upcoming_title()}
          </h3>
          <p sx={styles.description}>{m.media_upcoming_description()}</p>
        </div>
        <span sx={styles.count}>{data.length}</span>
      </div>
      <ul sx={styles.list}>
        {data.slice(0, data.length - hidden).map((chapter) => (
          <li key={chapter.id} sx={styles.row}>
            <span sx={styles.label}>
              <LanguageFlag language={chapter.language} />
              <span sx={styles.labelText}>
                {getChapterLabel(chapter)}
                {chapter.title === null ? null : (
                  <span sx={styles.chapterTitle}> – {chapter.title}</span>
                )}
              </span>
              {chapter.isExternal ? (
                <span title={m.chapter_external()}>
                  <Globe size={14} {...stylex.props(styles.external)} />
                </span>
              ) : null}
            </span>
            <span sx={styles.time}>
              <CalendarClock size={16} {...stylex.props(styles.timeIcon)} />
              <TimeAgo date={chapter.publishAt} future />
            </span>
            <ChapterGroups groups={chapter.groups} max={3} wrap />
            {can("chapter.update", {
              uploaderId: chapter.uploader.id,
              status: "SCHEDULED",
              groupIds: chapter.groups.map((group) => group.id),
            }) ? (
              <div sx={styles.actions}>
                <ScheduleActions chapter={chapter} />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {data.length > COLLAPSED_ROWS ? (
        <Button
          onClick={() => {
            setExpanded(!expanded)
          }}
          size="sm"
          sx={styles.more}
          variant="ghost"
        >
          {expanded ? m.media_upcoming_less() : m.media_upcoming_more({ count: hidden })}
        </Button>
      ) : null}
    </section>
  )
}
