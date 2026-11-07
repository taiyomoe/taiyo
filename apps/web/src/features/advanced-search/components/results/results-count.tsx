import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSearchResults } from "@/features/advanced-search/hooks/use-search-results"
import { formatNumber } from "@/features/dashboard/lib/format"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  count: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
  },
})

export function ResultsCount() {
  const { total } = useSearchResults()

  return (
    <p aria-live="polite" sx={styles.count}>
      {total === 1 ? m.search_count_one() : m.search_count({ count: formatNumber(total) })}
    </p>
  )
}
