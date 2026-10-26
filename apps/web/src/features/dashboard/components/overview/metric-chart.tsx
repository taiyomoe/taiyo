import type { ReactNode } from "react"
import type { DashboardOverview } from "@/features/dashboard/api/overview"
import { CardNote } from "@/features/dashboard/components/overview/card-note"

type MetricChartProps = {
  metric: DashboardOverview["metrics"]["reads"]
  empty: string
  children: ReactNode
}

export function MetricChart({ metric, empty, children }: MetricChartProps) {
  return metric.total === 0 && metric.previousTotal === 0 ? <CardNote>{empty}</CardNote> : children
}
