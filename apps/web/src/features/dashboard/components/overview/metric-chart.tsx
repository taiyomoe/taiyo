import type { ReactNode } from "react"
import type { DashboardOverview } from "@/features/dashboard/api/overview"
import { CardNote } from "@/features/dashboard/components/overview/card-note"

export function MetricChart({
  metric,
  empty,
  children,
}: {
  metric: DashboardOverview["metrics"]["reads"]
  empty: string
  children: ReactNode
}) {
  return metric.total === 0 && metric.previousTotal === 0 ? <CardNote>{empty}</CardNote> : children
}
