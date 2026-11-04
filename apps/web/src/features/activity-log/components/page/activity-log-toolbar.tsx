import type { KqlSyntaxError } from "@taiyomoe/audit/query"
import * as stylex from "@stylexjs/stylex"
import { containers } from "@taiyomoe/ui/styles/tokens.stylex"
import type { UpdateSearch } from "@/features/activity-log/hooks/use-activity-log"
import type { ActivityLogSearch } from "@/features/activity-log/lib/activity-log"
import { DateRangePicker } from "@/features/activity-log/components/date-range-picker"
import { KqlInput } from "@/features/activity-log/components/kql-input"

const styles = stylex.create({
  toolbar: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  searchRow: {
    gap: "0.75rem",
    alignItems: "flex-start",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [containers["5xl"]]: "minmax(0, 1fr) auto",
    },
  },
})

export function ActivityLogToolbar({
  draft,
  error,
  fetching,
  from,
  refresh,
  to,
  onDraftChange,
  onSubmit,
  onUpdate,
}: {
  draft: string
  error: KqlSyntaxError | null
  fetching: boolean
  from: string
  refresh: ActivityLogSearch["refresh"]
  to: string
  onDraftChange: (text: string) => void
  onSubmit: (text: string) => void
  onUpdate: UpdateSearch
}) {
  return (
    <div sx={styles.toolbar}>
      <div sx={styles.searchRow}>
        <KqlInput error={error} onChange={onDraftChange} onSubmit={onSubmit} value={draft} />
        <DateRangePicker
          fetching={fetching}
          from={from}
          onChange={(next) => {
            onUpdate({ from: next.from, to: next.to })
          }}
          onRefresh={() => {
            onSubmit(draft)
          }}
          onRefreshChange={(next) => {
            onUpdate({ refresh: next }, { keepPage: true })
          }}
          refresh={refresh}
          to={to}
        />
      </div>
    </div>
  )
}
