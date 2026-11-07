import * as stylex from "@stylexjs/stylex"
import { Book, Bookmark } from "@taiyomoe/ui/components/icons"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { SearchHit } from "@/features/advanced-search/hooks/use-search-results"
import { formatCompact, formatNumber } from "@/features/dashboard/lib/format"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  stats: {
    margin: 0,
    gap: "1rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 500,
  },
  stat: {
    gap: "0.3125rem",
    alignItems: "center",
    display: "inline-flex",
    whiteSpace: "nowrap",
  },
  value: {
    color: colors.foreground,
  },
  srOnly: {
    margin: "-1px",
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    clipPath: "inset(50%)",
    position: "absolute",
    whiteSpace: "nowrap",
    height: 1,
    width: 1,
  },
})

export function ResultStats({ hit }: { hit: SearchHit }) {
  const year = hit.startDate === null ? null : new Date(hit.startDate).getUTCFullYear()

  return (
    <p sx={styles.stats}>
      <span
        sx={styles.stat}
        title={m.search_result_followers({ count: formatNumber(hit.libraryCount) })}
      >
        <Bookmark aria-hidden size={14} />
        <span sx={styles.value}>{formatCompact(hit.libraryCount)}</span>
        <span sx={styles.srOnly}>{m.search_result_followers_label()}</span>
      </span>
      <span
        sx={styles.stat}
        title={m.search_result_chapters({ count: formatNumber(hit.chapterCount) })}
      >
        <Book aria-hidden size={14} />
        <span sx={styles.value}>{formatCompact(hit.chapterCount)}</span>
        <span sx={styles.srOnly}>{m.search_result_chapters_label()}</span>
      </span>
      {year === null ? null : <span sx={styles.stat}>{year}</span>}
    </p>
  )
}
