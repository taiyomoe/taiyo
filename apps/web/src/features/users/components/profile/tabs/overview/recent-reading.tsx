import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints, colors, font, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import { range } from "remeda"
import { Cover } from "@/features/media/components/cover"
import {
  type ReadingHistoryEntry,
  readingHistoryQueryOptions,
  type UserProfile,
} from "@/features/users/api/profile"
import { profileStyles } from "@/features/users/components/profile/profile-styles"
import { useNow } from "@/hooks/use-now"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const ROW_BLEED = "0.75rem"
const styles = stylex.create({
  card: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
  },
  head: {
    paddingBottom: "0.25rem",
  },
  days: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  dayHead: {
    gap: "1rem",
    alignItems: "baseline",
    display: "flex",
    justifyContent: "space-between",
    paddingBottom: "0.375rem",
    paddingTop: "1rem",
  },
  dayLabel: {
    fontSize: "0.875rem",
    fontWeight: 600,
  },
  dayMeta: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    whiteSpace: "nowrap",
  },
  rows: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    borderRadius: radius.lg,
    gap: "0.875rem",
    marginInline: `calc(-1 * ${ROW_BLEED})`,
    paddingBlock: "0.5rem",
    paddingInline: ROW_BLEED,
    textDecoration: "none",
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": `color-mix(in srgb, ${colors.foreground} 5%, transparent)`,
    },
    color: "inherit",
    display: "flex",
    outlineColor: colors.ring,
    outlineOffset: -2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    transitionDuration: motion.enter,
    transitionProperty: "background-color",
    minWidth: 0,
  },
  cover: {
    borderRadius: radius.sm,
    flexShrink: 0,
    width: "2.5rem",
  },
  main: {
    gap: "0.3125rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  title: {
    overflow: "hidden",
    fontSize: "0.9375rem",
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chapters: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  chip: {
    borderColor: `color-mix(in srgb, ${colors.primary} 40%, transparent)`,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    paddingBlock: "0.0625rem",
    paddingInline: "0.5rem",
    backgroundColor: `color-mix(in srgb, ${colors.primary} 10%, transparent)`,
    color: `color-mix(in srgb, ${colors.primary} 70%, ${colors.foreground})`,
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  count: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  time: {
    alignSelf: "flex-start",
    color: colors.mutedForeground,
    display: { default: "none", [breakpoints.sm]: "block" },
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
    paddingTop: "0.125rem",
  },
  skeletonRow: {
    gap: "0.875rem",
    paddingBlock: "0.5rem",
    alignItems: "center",
    display: "flex",
  },
  skeletonCover: {
    borderRadius: radius.sm,
    height: "3.5rem",
    width: "2.5rem",
  },
  skeletonText: {
    height: "0.875rem",
    width: "min(16rem, 60%)",
  },
})
const formatNumber = (value: number) =>
  new Intl.NumberFormat(getLocale(), { maximumFractionDigits: 2 }).format(value)
const countChapters = (count: number) =>
  count === 1
    ? m.profile_history_chapters_one()
    : m.profile_history_chapters({ count: formatNumber(count) })
const countTitles = (count: number) =>
  count === 1
    ? m.profile_history_titles_one()
    : m.profile_history_titles({ count: formatNumber(count) })
const groupByDay = (entries: ReadingHistoryEntry[]) => {
  const days = new Map<string, ReadingHistoryEntry[]>()

  for (const entry of entries) {
    days.set(entry.day, [...(days.get(entry.day) ?? []), entry])
  }

  return [...days.entries()]
}

function DayLabel({ day, today }: { day: string; today: string }) {
  const date = new Date(`${day}T00:00:00Z`)
  const yesterday = new Date(`${today}T00:00:00Z`)

  yesterday.setUTCDate(yesterday.getUTCDate() - 1)

  if (day === today) {
    return m.profile_history_today()
  }

  if (day === yesterday.toISOString().slice(0, 10)) {
    return m.profile_history_yesterday()
  }

  return new Intl.DateTimeFormat(getLocale(), {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    ...(date.getUTCFullYear() === new Date(`${today}T00:00:00Z`).getUTCFullYear()
      ? {}
      : { year: "numeric" }),
  }).format(date)
}

function HistoryRow({ entry, timeZone }: { entry: ReadingHistoryEntry; timeZone: string }) {
  const single = entry.firstNumber === entry.lastNumber

  return (
    <li>
      <Link params={{ mediaId: entry.media.id }} to="/media/$mediaId" {...stylex.props(styles.row)}>
        <Cover alt="" src={entry.media.coverUrl} sx={styles.cover} />
        <span sx={styles.main}>
          <span sx={styles.title} title={entry.media.title ?? undefined}>
            {entry.media.title ?? m.media_untitled()}
          </span>
          <span sx={styles.chapters}>
            <span sx={styles.chip}>
              {single
                ? m.profile_history_chapter({ number: formatNumber(entry.lastNumber) })
                : m.profile_history_chapter_range({
                    from: formatNumber(entry.firstNumber),
                    to: formatNumber(entry.lastNumber),
                  })}
            </span>
            {entry.chapters > 1 ? (
              <span sx={styles.count}>{countChapters(entry.chapters)}</span>
            ) : null}
          </span>
        </span>
        <time dateTime={entry.lastReadAt} sx={styles.time}>
          {new Intl.DateTimeFormat(getLocale(), {
            hour: "2-digit",
            minute: "2-digit",
            timeZone,
          }).format(new Date(entry.lastReadAt))}
        </time>
      </Link>
    </li>
  )
}

function HistorySkeleton() {
  return (
    <div aria-hidden>
      {range(0, 3).map((index) => (
        <div key={index} sx={styles.skeletonRow}>
          <Skeleton sx={styles.skeletonCover} />
          <Skeleton sx={styles.skeletonText} />
        </div>
      ))}
    </div>
  )
}

function HistoryDays({ entries, timeZone }: { entries: ReadingHistoryEntry[]; timeZone: string }) {
  const now = useNow()
  const today = new Intl.DateTimeFormat("en-CA", { timeZone }).format(now)

  return (
    <ol sx={styles.days}>
      {groupByDay(entries).map(([day, dayEntries]) => {
        const chapters = dayEntries.reduce((sum, entry) => sum + entry.chapters, 0)

        return (
          <li key={day}>
            <div sx={styles.dayHead}>
              <h3 sx={[profileStyles.sectionTitle, styles.dayLabel]}>
                <DayLabel day={day} today={today} />
              </h3>
              <span sx={styles.dayMeta}>
                {countChapters(chapters)} · {countTitles(dayEntries.length)}
              </span>
            </div>
            <ul sx={styles.rows}>
              {dayEntries.map((entry) => (
                <HistoryRow key={entry.media.id} entry={entry} timeZone={timeZone} />
              ))}
            </ul>
          </li>
        )
      })}
    </ol>
  )
}

function HistoryContent({ profile }: { profile: UserProfile }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const [timeZone] = useState(() => new Intl.DateTimeFormat().resolvedOptions().timeZone)
  const history = useQuery(readingHistoryQueryOptions(profile.id, contentRatings, timeZone))

  if (history.data === undefined) {
    return <HistorySkeleton />
  }

  if (history.data.hidden) {
    return (
      <p sx={profileStyles.empty}>{m.profile_history_private({ name: profile.displayUsername })}</p>
    )
  }

  if (history.data.entries.length === 0) {
    return <p sx={profileStyles.empty}>{m.profile_history_empty()}</p>
  }

  return <HistoryDays entries={history.data.entries} timeZone={timeZone} />
}

export function RecentReading({ profile }: { profile: UserProfile }) {
  return (
    <section sx={[profileStyles.card, styles.card]}>
      <div sx={styles.head}>
        <h2 sx={profileStyles.sectionTitle}>{m.profile_history_title()}</h2>
      </div>
      <HistoryContent profile={profile} />
    </section>
  )
}
