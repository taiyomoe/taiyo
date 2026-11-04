import type { AuditLogHistogramInterval } from "@taiyomoe/audit/query"
import type { ReactNode } from "react"
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import type { AuditLogHistogram } from "@/features/activity-log/api/audit-logs"
import { LogHistogram } from "@/features/activity-log/components/log-histogram"
import { pageStyles } from "@/features/activity-log/components/page/page-styles"
import { describeInterval } from "@/features/activity-log/lib/format"
import { CardNote } from "@/features/dashboard/components/overview/card-note"
import { CardSkeleton } from "@/features/dashboard/components/overview/card-skeleton"
import { DashboardCard } from "@/features/dashboard/components/overview/dashboard-card"
import { m } from "@/paraglide/messages"

export function HistogramCard({
  blocked,
  histogram,
  interval,
  rangeLabel,
  stale,
  to,
  onZoom,
}: {
  blocked: boolean
  histogram: AuditLogHistogram | undefined
  interval: AuditLogHistogramInterval
  rangeLabel: string
  stale: boolean
  to: string
  onZoom: (range: { from: string; to: string }) => void
}) {
  let content: ReactNode = <CardSkeleton />

  if (blocked) {
    content = <CardNote>{m.activity_fix_query()}</CardNote>
  } else if (histogram !== undefined) {
    content = (
      <div aria-busy={stale} sx={pageStyles.stale}>
        <LogHistogram histogram={histogram} onZoom={onZoom} to={to} />
      </div>
    )
  }

  return (
    <DashboardCard
      settings={false}
      subtitle={m.activity_histogram_subtitle({
        range: rangeLabel,
        interval: describeInterval(histogram?.interval ?? interval),
      })}
      title={m.activity_histogram_title()}
    >
      {content}
    </DashboardCard>
  )
}
