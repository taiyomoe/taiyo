import * as stylex from "@stylexjs/stylex"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { DashboardOverview } from "@/lib/queries/dashboard"
import { CardNote } from "@/components/dashboard/overview/dashboard-card"
import { formatCompact, formatNumber } from "@/components/dashboard/overview/format"
import { Cover } from "@/components/media/cover"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    gap: "0.875rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    gap: "1rem",
    alignItems: "center",
    display: "grid",
    gridTemplateColumns: "1rem 2rem minmax(0, 1fr) auto",
  },
  rank: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    textAlign: "center",
  },
  cover: {
    borderRadius: radius.sm,
    width: "2rem",
  },
  main: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  title: {
    overflow: "hidden",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 72%, ${colors.background})`,
    },
    fontSize: "0.9375rem",
    fontWeight: 600,
    textDecorationLine: "none",
    textOverflow: "ellipsis",
    transitionDuration: "150ms",
    transitionProperty: "color",
    whiteSpace: "nowrap",
  },
  track: {
    borderRadius: radius.full,
    overflow: "hidden",
    backgroundColor: colors.well,
    height: "0.375rem",
  },
  fill: {
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    height: "100%",
  },
  value: {
    fontFamily: font.mono,
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    textAlign: "end",
    minWidth: "3rem",
  },
})

export function TopMedias({ overview: { topMedias } }: { overview: DashboardOverview }) {
  const max = Math.max(1, ...topMedias.map(({ reads }) => reads))

  if (topMedias.length === 0) {
    return <CardNote>{m.dashboard_empty_reads()}</CardNote>
  }

  return (
    <ol sx={styles.list}>
      {topMedias.map((media, index) => (
        <li key={media.id} sx={styles.row}>
          <span sx={styles.rank}>{index + 1}</span>
          <Cover src={media.coverUrl} sx={styles.cover} />
          <div sx={styles.main}>
            <Link
              params={{ mediaId: media.id }}
              to="/media/$mediaId"
              {...stylex.props(styles.title)}
            >
              {media.title ?? m.media_untitled()}
            </Link>
            <div
              aria-label={m.dashboard_top_media_reads({ reads: formatNumber(media.reads) })}
              role="img"
              sx={styles.track}
            >
              <div style={{ width: `${(media.reads / max) * 100}%` }} sx={styles.fill} />
            </div>
          </div>
          <span sx={styles.value}>{formatCompact(media.reads)}</span>
        </li>
      ))}
    </ol>
  )
}
