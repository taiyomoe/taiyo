import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { FacetKey, FacetValue } from "@/features/activity-log/components/breakdown/types"
import { FacetRow } from "@/features/activity-log/components/breakdown/facet-row"
import { m } from "@/paraglide/messages"

const VISIBLE = 5
const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    gap: "0.125rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  empty: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
})

export function FacetList({
  facetKey,
  field,
  values,
  total,
  onFilter,
}: {
  facetKey: FacetKey
  field: string
  values: readonly FacetValue[]
  total: number
  onFilter: (field: string, value: string, negate: boolean) => void
}) {
  if (values.length === 0) {
    return <p sx={styles.empty}>{m.activity_breakdown_empty()}</p>
  }

  return (
    <ul sx={styles.list}>
      {values.slice(0, VISIBLE).map((entry) => (
        <FacetRow
          entry={entry}
          facetKey={facetKey}
          field={field}
          key={entry.value}
          onFilter={onFilter}
          total={total}
        />
      ))}
    </ul>
  )
}
