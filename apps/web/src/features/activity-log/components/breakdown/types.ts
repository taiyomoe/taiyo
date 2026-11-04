import type { AuditLogFacets } from "@/features/activity-log/api/audit-logs"

export type FacetKey = Exclude<keyof AuditLogFacets, "total">

export type FacetValue = {
  value: string
  count: number
  type?: string
  displayName?: string | null
  image?: string | null
}
