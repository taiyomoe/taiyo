import * as stylex from "@stylexjs/stylex"
import { Avatar, AvatarFallback, AvatarImage } from "@taiyomoe/ui/components/ui/avatar"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { DashboardOverview } from "@/lib/queries/dashboard"
import { CardNote } from "@/components/dashboard/overview/dashboard-card"
import { formatTime } from "@/components/dashboard/overview/format"
import { useNow } from "@/lib/use-now"
import { m } from "@/paraglide/messages"

type Activity = DashboardOverview["recentActivity"][number]

const TONES = [colors.chart1, colors.chart5, colors.chart3, colors.chart2, colors.chart4]
const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    gap: "1.125rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    gap: "0.875rem",
    alignItems: "flex-start",
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr) auto",
  },
  avatar: {
    fontSize: "0.875rem",
    fontWeight: 700,
    height: "2.25rem",
    width: "2.25rem",
  },
  fallback: {
    color: colors.primaryForeground,
  },
  text: {
    margin: 0,
    fontSize: "0.9375rem",
    lineHeight: "1.375rem",
    overflowWrap: "anywhere",
  },
  actor: {
    fontWeight: 600,
  },
  time: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
    lineHeight: "1.375rem",
    whiteSpace: "nowrap",
  },
})
const describe = ({ kind, count, media }: Activity) => {
  const title = media.title ?? m.media_untitled()

  if (kind === "MEDIA_CREATED") {
    return m.dashboard_activity_media_created({ title })
  }

  if (kind === "COVERS_UPLOADED") {
    return count === 1
      ? m.dashboard_activity_cover_uploaded({ title })
      : m.dashboard_activity_covers_uploaded({ count, title })
  }

  return count === 1
    ? m.dashboard_activity_chapter_uploaded({ title })
    : m.dashboard_activity_chapters_uploaded({ count, title })
}
const toneFor = (id: string) =>
  TONES[Number.parseInt(id.slice(0, 8), 16) % TONES.length] ?? colors.primary

export function RecentActivity({ overview: { recentActivity } }: { overview: DashboardOverview }) {
  const now = useNow()

  if (recentActivity.length === 0) {
    return <CardNote>{m.dashboard_empty_activity()}</CardNote>
  }

  return (
    <ol sx={styles.list}>
      {recentActivity.map((activity) => (
        <li key={`${activity.kind}-${activity.actor.id}-${activity.at}`} sx={styles.row}>
          <Avatar sx={styles.avatar}>
            {activity.actor.image === null || activity.actor.image === "" ? null : (
              <AvatarImage alt="" src={activity.actor.image} />
            )}
            <AvatarFallback
              style={{ backgroundColor: toneFor(activity.actor.id) }}
              sx={styles.fallback}
            >
              {activity.actor.displayUsername.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p sx={styles.text}>
            <span sx={styles.actor}>{activity.actor.displayUsername}</span> {describe(activity)}
          </p>
          <time dateTime={activity.at} sx={styles.time}>
            {formatTime(activity.at, now)}
          </time>
        </li>
      ))}
    </ol>
  )
}
