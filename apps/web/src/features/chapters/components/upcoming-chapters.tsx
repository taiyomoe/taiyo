import * as stylex from "@stylexjs/stylex"
import { CalendarClock } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints, colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useDeferredValue, useState } from "react"
import type { Session } from "@/lib/session"
import { upcomingChaptersQueryOptions } from "@/features/chapters/api/chapters"
import { UpcomingChapterRow } from "@/features/chapters/components/upcoming-chapter-row"
import { usePermissions } from "@/lib/permissions"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const COLLAPSED_ROWS = 3
const styles = stylex.create({
  card: {
    padding: { [breakpoints.md]: "0.875rem", default: "0.625rem" },
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
    fontSize: { [breakpoints.md]: "1.125rem", default: "1rem" },
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
          <UpcomingChapterRow
            key={chapter.id}
            chapter={chapter}
            editable={can("chapter.update", {
              uploaderId: chapter.uploader.id,
              status: "SCHEDULED",
              groupIds: chapter.groups.map((group) => group.id),
            })}
          />
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
