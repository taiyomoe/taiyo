import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useDeferredValue } from "react"
import { formatNumber } from "@/features/dashboard/lib/format"
import { LIBRARY_STATUS_LABELS, LIBRARY_STATUSES } from "@/features/library/lib/library-statuses"
import { type MediaStats as Stats, mediaStatsQueryOptions } from "@/features/ratings/api/ratings"
import { StarGlyph } from "@/features/ratings/components/star-glyph"
import { formatAverage, hasEnoughRatings } from "@/features/ratings/lib/ratings"
import { profileStyles } from "@/features/users/components/profile/profile-styles"
import { BarList } from "@/features/users/components/profile/tabs/bar-list"
import { StatsCard } from "@/features/users/components/profile/tabs/stats-card"
import { StatsTabSkeleton } from "@/features/users/components/profile/tabs/stats-skeleton"
import { statsStyles } from "@/features/users/components/profile/tabs/stats-styles"
import { getErrorMessage } from "@/lib/errors"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  top: {
    gap: "1.25rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.lg]: "minmax(0, 1fr) minmax(0, 2fr)",
    },
  },
  score: {
    gap: "0.5rem",
    alignItems: "baseline",
    display: "flex",
    flexWrap: "wrap",
  },
  average: {
    margin: 0,
    fontFamily: font.mono,
    fontSize: "2.5rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
    lineHeight: 1,
  },
  max: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "1rem",
    fontWeight: 600,
  },
  scoreLabel: {
    gap: "0.375rem",
    alignItems: "center",
    display: "inline-flex",
    fontFamily: font.mono,
    fontVariantNumeric: "tabular-nums",
  },
  star: {
    color: colors.warning,
    flexShrink: 0,
    height: "0.875rem",
    width: "0.875rem",
  },
})
const ratingsNote = (count: number) =>
  count === 1 ? m.rating_count_one() : m.rating_count({ count: formatNumber(count) })

function Score({ rating }: { rating: Stats["rating"] }) {
  const { count, average } = rating

  return (
    <StatsCard flush note={ratingsNote(count)} title={m.media_stats_score()}>
      {average === null || !hasEnoughRatings(count) ? (
        <p sx={profileStyles.empty}>
          {count === 0
            ? m.media_stats_no_ratings()
            : m.rating_not_enough_title({ min: config.ratings.minCountForAverage })}
        </p>
      ) : (
        <p
          aria-label={m.rating_community_label({
            average: formatAverage(average),
            max: config.ratings.maxScore,
            count: formatNumber(count),
          })}
          sx={styles.score}
        >
          <span aria-hidden sx={styles.average}>
            {formatAverage(average)}
          </span>
          <span aria-hidden sx={styles.max}>
            / {config.ratings.maxScore}
          </span>
        </p>
      )}
    </StatsCard>
  )
}

export function MediaStats({ mediaId }: { mediaId: string }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const stats = useQuery(mediaStatsQueryOptions(mediaId, contentRatings))

  if (stats.error !== null) {
    return <p sx={profileStyles.empty}>{getErrorMessage(stats.error)}</p>
  }

  if (stats.data === undefined) {
    return <StatsTabSkeleton />
  }

  const { rating, library } = stats.data

  return (
    <div sx={statsStyles.root}>
      <div sx={styles.top}>
        <Score rating={rating} />
        <StatsCard flush title={m.media_stats_distribution()}>
          {rating.count === 0 ? (
            <p sx={profileStyles.empty}>{m.media_stats_no_ratings()}</p>
          ) : (
            <BarList
              items={[...rating.distribution].reverse().map((row) => ({
                key: String(row.score),
                label: (
                  <span sx={styles.scoreLabel}>
                    <StarGlyph sx={styles.star} />
                    {row.score}
                  </span>
                ),
                value: row.count,
                title: m.media_stats_distribution_row({
                  score: row.score,
                  count: formatNumber(row.count),
                }),
              }))}
            />
          )}
        </StatsCard>
      </div>
      <StatsCard
        note={
          library.total === 1
            ? m.media_stats_library_total_one()
            : m.media_stats_library_total({ count: formatNumber(library.total) })
        }
        title={m.media_stats_library()}
      >
        {library.total === 0 ? (
          <p sx={profileStyles.empty}>{m.media_stats_no_library()}</p>
        ) : (
          <BarList
            items={LIBRARY_STATUSES.map((status) => ({
              key: status,
              label: LIBRARY_STATUS_LABELS[status](),
              value: library.byStatus[status],
              title: `${LIBRARY_STATUS_LABELS[status]()}: ${formatNumber(library.byStatus[status])}`,
            }))}
          />
        )}
      </StatsCard>
    </div>
  )
}
