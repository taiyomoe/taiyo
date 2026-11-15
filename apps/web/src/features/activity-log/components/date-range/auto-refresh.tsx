import * as stylex from "@stylexjs/stylex"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { Switch } from "@taiyomoe/ui/components/ui/switch"
import type { DateMathUnit } from "@/features/activity-log/lib/datemath"
import { dateRangeStyles } from "@/features/activity-log/components/date-range/date-range-styles"
import { REFRESH_INTERVALS, type RefreshInterval } from "@/features/activity-log/lib/activity-log"
import { formatDuration } from "@/features/activity-log/lib/format"
import { m } from "@/paraglide/messages"

const REFRESH_DURATIONS: Record<RefreshInterval, [number, DateMathUnit]> = {
  "5s": [5, "s"],
  "10s": [10, "s"],
  "30s": [30, "s"],
  "1m": [1, "m"],
  "5m": [5, "m"],
  "15m": [15, "m"],
  "1h": [1, "h"],
}
const describeRefresh = (interval: RefreshInterval) =>
  formatDuration(...REFRESH_DURATIONS[interval])
const styles = stylex.create({
  refreshRow: {
    gap: "0.75rem",
    alignItems: "center",
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
  },
})

export function AutoRefresh({
  refresh,
  refreshValue,
  onRefreshChange,
  onRefreshValueChange,
}: {
  refresh: RefreshInterval | undefined
  refreshValue: RefreshInterval
  onRefreshChange: (refresh: RefreshInterval | undefined) => void
  onRefreshValueChange: (refresh: RefreshInterval) => void
}) {
  return (
    <section sx={dateRangeStyles.section}>
      <p sx={dateRangeStyles.sectionTitle}>{m.activity_refresh_every()}</p>
      <div sx={styles.refreshRow}>
        <Switch
          aria-label={m.activity_auto_refresh()}
          checked={refresh !== undefined}
          onCheckedChange={(checked) => {
            onRefreshChange(checked ? refreshValue : undefined)
          }}
        />
        <Select
          items={REFRESH_INTERVALS.map((value) => ({ value, label: describeRefresh(value) }))}
          onValueChange={(value) => {
            const next = REFRESH_INTERVALS.find((candidate) => candidate === value)

            if (next !== undefined) {
              onRefreshValueChange(next)

              if (refresh !== undefined) {
                onRefreshChange(next)
              }
            }
          }}
          value={refreshValue}
        >
          <SelectTrigger aria-label={m.activity_refresh_interval()}>
            <SelectValue />
          </SelectTrigger>
          <SelectPopup>
            {REFRESH_INTERVALS.map((value) => (
              <SelectItem key={value} value={value}>
                {describeRefresh(value)}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      </div>
    </section>
  )
}
