import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { formatTimeAgo } from "@/components/time/format-time-ago"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  timeDetails: {
    gap: "0.625rem",
    paddingInline: "1rem",
    display: "flex",
    flexDirection: "column",
    maxWidth: "min(20rem, calc(100vw - 2rem))",
  },
  timeRelative: {
    margin: 0,
    color: colors.foreground,
    fontSize: "0.875rem",
    fontWeight: 600,
  },
  timeList: {
    margin: 0,
    columnGap: "1rem",
    display: "grid",
    fontSize: "0.8125rem",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    rowGap: "0.375rem",
  },
  timeLabel: {
    color: colors.mutedForeground,
  },
  timeValue: {
    margin: 0,
    color: colors.foreground,
    fontVariantNumeric: "tabular-nums",
  },
  timeZone: {
    color: colors.mutedForeground,
    display: "block",
    fontSize: "0.75rem",
    overflowWrap: "anywhere",
  },
})

type TimeDetailsProps = {
  date: Date
  future: boolean
  now: number
}

export function TimeDetails({ date, future, now }: TimeDetailsProps) {
  const locale = getLocale()
  const { timeZone } = new Intl.DateTimeFormat().resolvedOptions()

  return (
    <div sx={styles.timeDetails}>
      <p sx={styles.timeRelative}>{formatTimeAgo(date, now, "long", future)}</p>
      <dl sx={styles.timeList}>
        <dt sx={styles.timeLabel}>{m.time_local()}</dt>
        <dd sx={styles.timeValue}>
          {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "medium" }).format(
            date,
          )}
          <span sx={styles.timeZone}>{timeZone}</span>
        </dd>
        <dt sx={styles.timeLabel}>{m.time_utc()}</dt>
        <dd sx={styles.timeValue}>
          {new Intl.DateTimeFormat(locale, {
            dateStyle: "medium",
            timeStyle: "medium",
            timeZone: "UTC",
          }).format(date)}
        </dd>
      </dl>
    </div>
  )
}
