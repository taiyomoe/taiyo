import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { useLayoutEffect, useMemo, useRef, useState } from "react"
import type { UserStats } from "@/features/users/api/profile"
import { useHoverTip } from "@/features/users/components/profile/tabs/hover-tip"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const WEEKS = 53
const DAY_MS = 86_400_000
const LEVELS = [
  `color-mix(in srgb, ${colors.foreground} 7%, transparent)`,
  `color-mix(in srgb, ${colors.primary} 30%, ${colors.card})`,
  `color-mix(in srgb, ${colors.primary} 55%, ${colors.card})`,
  `color-mix(in srgb, ${colors.primary} 78%, ${colors.card})`,
  colors.primary,
]
const styles = stylex.create({
  root: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  scroller: {
    scrollbarWidth: "thin",
    overflowX: "auto",
    paddingBottom: "0.25rem",
  },
  calendar: {
    gap: "3px",
    display: "grid",
    gridAutoColumns: "11px",
    gridAutoFlow: "column",
    gridTemplateRows: "14px repeat(7, 11px)",
    width: "max-content",
  },
  month: {
    gridRow: "1",
    color: colors.mutedForeground,
    fontSize: "0.6875rem",
    lineHeight: "14px",
    whiteSpace: "nowrap",
  },
  cell: {
    borderRadius: "2.5px",
    outlineColor: `color-mix(in srgb, ${colors.foreground} 45%, transparent)`,
    outlineOffset: 1,
    outlineStyle: { default: "none", ":hover": "solid" },
    outlineWidth: 1,
  },
  footer: {
    gap: "0.75rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.75rem",
    justifyContent: "space-between",
  },
  scale: {
    gap: "3px",
    alignItems: "center",
    display: "flex",
  },
  step: {
    borderRadius: "2.5px",
    height: "11px",
    width: "11px",
  },
  scaleLabel: {
    marginInline: "0.25rem",
  },
  total: {
    fontFamily: font.mono,
    fontVariantNumeric: "tabular-nums",
  },
})
const toKey = (time: number) => new Date(time).toISOString().slice(0, 10)
const describeDay = (count: number, date: string) => {
  if (count === 0) {
    return m.profile_stats_activity_day_none({ date })
  }

  return count === 1
    ? m.profile_stats_activity_day_one({ date })
    : m.profile_stats_activity_day({ count, date })
}

export function ActivityCalendar({ activity }: { activity: UserStats["reading"] & object }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const tip = useHoverTip()
  const [today] = useState(() => Date.parse(toKey(Date.now())))
  const { columns, months, total } = useMemo(() => {
    const counts = new Map(activity.activity.map((day) => [day.date, day.count]))
    // Weeks start on Monday; the last column holds the current week.
    const weekday = (new Date(today).getUTCDay() + 6) % 7
    const start = today - (weekday + (WEEKS - 1) * 7) * DAY_MS
    const max = Math.max(1, ...counts.values())
    const dateFormat = new Intl.DateTimeFormat(getLocale(), {
      dateStyle: "medium",
      timeZone: "UTC",
    })
    const monthFormat = new Intl.DateTimeFormat(getLocale(), { month: "short", timeZone: "UTC" })
    const weeks = Array.from({ length: WEEKS }, (_, week) =>
      Array.from({ length: 7 }, (__, day) => {
        const time = start + (week * 7 + day) * DAY_MS

        if (time > today) {
          return null
        }

        const count = counts.get(toKey(time)) ?? 0
        const date = dateFormat.format(time)

        return {
          key: toKey(time),
          level: count === 0 ? 0 : Math.min(4, Math.max(1, Math.ceil((count / max) * 4))),
          tip: describeDay(count, date),
        }
      }),
    )
    const labels = weeks.flatMap((_, week) => {
      const first = new Date(start + week * 7 * DAY_MS)
      const previous = new Date(start + (week - 1) * 7 * DAY_MS)

      return week > 0 && first.getUTCMonth() === previous.getUTCMonth()
        ? []
        : [{ week, label: monthFormat.format(first) }]
    })

    return {
      columns: weeks,
      months: labels.filter((label, index) => labels[index + 1]?.week !== label.week + 1),
      total: activity.activity.reduce((sum, day) => sum + day.count, 0),
    }
  }, [activity.activity, today])

  // On narrow screens, start at the most recent weeks.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current

    if (scroller !== null) {
      scroller.scrollLeft = scroller.scrollWidth
    }
  }, [])

  return (
    <div sx={styles.root}>
      <div ref={scrollerRef} sx={styles.scroller}>
        <div
          aria-label={m.profile_stats_activity_summary({ count: total.toLocaleString() })}
          role="img"
          sx={styles.calendar}
          {...tip.handlers}
        >
          {months.map(({ week, label }) => (
            <span
              key={`m-${week}`}
              style={{ gridColumn: `${week + 1} / span 4` }}
              sx={styles.month}
            >
              {label}
            </span>
          ))}
          {columns.flatMap((days, week) =>
            days.map((day, index) =>
              day === null ? null : (
                <span
                  key={day.key}
                  data-tip={day.tip}
                  style={{
                    backgroundColor: LEVELS[day.level],
                    gridColumn: week + 1,
                    gridRow: index + 2,
                  }}
                  sx={styles.cell}
                />
              ),
            ),
          )}
        </div>
      </div>
      <div sx={styles.footer}>
        <span sx={styles.total}>
          {m.profile_stats_activity_summary({ count: total.toLocaleString() })}
        </span>
        <span aria-hidden sx={styles.scale}>
          <span sx={styles.scaleLabel}>{m.profile_stats_less()}</span>
          {LEVELS.map((level) => (
            <span key={level} style={{ backgroundColor: level }} sx={styles.step} />
          ))}
          <span sx={styles.scaleLabel}>{m.profile_stats_more()}</span>
        </span>
      </div>
      {tip.element}
    </div>
  )
}
