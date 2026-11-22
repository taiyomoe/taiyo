import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { Star } from "@taiyomoe/ui/components/icons"
import { a11y } from "@taiyomoe/ui/styles/recipes"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useDeferredValue } from "react"
import { Pill } from "@/components/badges/pill"
import { formatCompact, formatNumber } from "@/features/dashboard/lib/format"
import { mediaStatsQueryOptions } from "@/features/ratings/api/ratings"
import { formatAverage, hasEnoughRatings } from "@/features/ratings/lib/ratings"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  star: {
    color: colors.warning,
  },
  average: {
    fontFamily: font.mono,
    fontVariantNumeric: "tabular-nums",
  },
  count: {
    color: colors.mutedForeground,
    fontWeight: 500,
    marginInlineStart: "0.3125rem",
  },
})

export function CommunityScore({ mediaId }: { mediaId: string }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data } = useQuery(mediaStatsQueryOptions(mediaId, contentRatings))

  if (data === undefined) {
    return null
  }

  const { count, average } = data.rating

  if (average === null || !hasEnoughRatings(count)) {
    return (
      <Pill
        icon={Star}
        title={m.rating_not_enough_title({ min: config.ratings.minCountForAverage })}
        variant="secondary"
      >
        {m.rating_not_enough()}
      </Pill>
    )
  }

  const label = m.rating_community_label({
    average: formatAverage(average),
    max: config.ratings.maxScore,
    count: formatNumber(count),
  })

  return (
    <Pill icon={Star} iconSx={styles.star} title={label} variant="secondary">
      <span aria-hidden>
        <span sx={styles.average}>{formatAverage(average)}</span>
        <span sx={styles.count}>{formatCompact(count)}</span>
      </span>
      <span sx={a11y.srOnly}>{label}</span>
    </Pill>
  )
}
