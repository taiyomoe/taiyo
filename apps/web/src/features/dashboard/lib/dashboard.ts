import type { Session } from "@/lib/session"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

export const DASHBOARD_RANGES = ["24h", "7d", "30d", "90d", "12m"] as const

export type DashboardRange = (typeof DASHBOARD_RANGES)[number]

export const DEFAULT_DASHBOARD_RANGE: DashboardRange = "30d"

export const DASHBOARD_RANGE_LABELS: Record<
  DashboardRange,
  { tab: () => string; short: () => string; period: () => string; unit: () => string }
> = {
  "24h": {
    tab: m.dashboard_range_24h,
    short: m.dashboard_range_24h,
    period: m.dashboard_period_24h,
    unit: m.dashboard_unit_hour,
  },
  "7d": {
    tab: m.dashboard_range_7d,
    short: m.dashboard_range_7d_short,
    period: m.dashboard_period_7d,
    unit: m.dashboard_unit_day,
  },
  "30d": {
    tab: m.dashboard_range_30d,
    short: m.dashboard_range_30d_short,
    period: m.dashboard_period_30d,
    unit: m.dashboard_unit_day,
  },
  "90d": {
    tab: m.dashboard_range_90d,
    short: m.dashboard_range_90d_short,
    period: m.dashboard_period_90d,
    unit: m.dashboard_unit_week,
  },
  "12m": {
    tab: m.dashboard_range_12m,
    short: m.dashboard_range_12m_short,
    period: m.dashboard_period_12m,
    unit: m.dashboard_unit_month,
  },
}

export const canOpenDashboard = (user: Session["user"]) => getPermissions(user)("dashboard.open")
