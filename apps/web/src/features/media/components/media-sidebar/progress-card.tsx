import * as stylex from "@stylexjs/stylex"
import { Progress } from "@taiyomoe/ui/components/ui/progress"
import { colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ReadingProgress } from "@/features/media/api/library"
import { TimeAgo } from "@/components/time/time-ago"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  card: {
    padding: "1rem",
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.75rem",
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    alignItems: "baseline",
    display: "flex",
    justifyContent: "space-between",
  },
  cardLabel: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  percent: {
    color: colors.primary,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    fontWeight: 600,
  },
  detail: {
    margin: 0,
    gap: "0.375rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontFamily: font.mono,
    fontSize: "0.75rem",
  },
})

type ProgressCardProps = {
  progress: ReadingProgress
}

export function ProgressCard({ progress }: ProgressCardProps) {
  const percent =
    progress.totalCount === 0 ? 0 : Math.round((progress.readCount / progress.totalCount) * 100)

  return (
    <section aria-label={m.media_progress_title()} sx={styles.card}>
      <div sx={styles.cardHeader}>
        <span sx={styles.cardLabel}>{m.media_progress_title()}</span>
        <span sx={styles.percent}>{percent}%</span>
      </div>
      <Progress aria-label={m.media_progress_title()} value={percent} />
      <p sx={styles.detail}>
        {m.media_progress_detail({ read: progress.readCount, total: progress.totalCount })}
      </p>
      {progress.lastRead === null ? null : (
        <p sx={styles.detail}>
          {m.media_progress_last({ number: progress.lastRead.number })}
          <span aria-hidden>·</span>
          <TimeAgo date={progress.lastRead.readAt} />
        </p>
      )}
    </section>
  )
}
