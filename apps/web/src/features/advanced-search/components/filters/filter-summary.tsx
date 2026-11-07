import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { FilterOptionIcon } from "@/features/advanced-search/lib/filter-options"
import { OptionLabel } from "@/features/advanced-search/components/filters/option-label"
import { m } from "@/paraglide/messages"

const VISIBLE_LABELS = 2
const styles = stylex.create({
  summary: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  labels: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  more: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  empty: {
    color: colors.mutedForeground,
  },
})

export function FilterSummary({
  labels,
  icon,
  empty = m.search_filter_any(),
}: {
  labels: string[]
  icon?: FilterOptionIcon | undefined
  empty?: ReactNode
}) {
  if (labels.length === 0) {
    return <span sx={styles.empty}>{empty}</span>
  }

  if (labels.length === 1) {
    return <OptionLabel icon={icon}>{labels[0]}</OptionLabel>
  }

  const hidden = labels.length - VISIBLE_LABELS

  return (
    <span sx={styles.summary} title={labels.join(", ")}>
      <span sx={styles.labels}>{labels.slice(0, VISIBLE_LABELS).join(", ")}</span>
      {hidden > 0 ? <span sx={styles.more}>+{hidden}</span> : null}
    </span>
  )
}
