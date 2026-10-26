import type { Session } from "@/lib/session"
import { getPermissions } from "@/lib/permissions"

export const DASHBOARD_RANGES = ["24h", "7d", "30d", "90d", "12m"] as const

export type DashboardRange = (typeof DASHBOARD_RANGES)[number]

export const DEFAULT_DASHBOARD_RANGE: DashboardRange = "30d"

export const canOpenDashboard = (user: Session["user"]) => getPermissions(user)("dashboard.open")
