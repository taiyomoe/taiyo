import type { BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
import type { AuditLogEntry } from "@/features/activity-log/api/audit-logs"
import { Pill } from "@/components/badges/pill"
import { m } from "@/paraglide/messages"

const SEVERITIES = {
  low: { label: m.activity_severity_low, variant: "secondary" },
  medium: { label: m.activity_severity_medium, variant: "info" },
  high: { label: m.activity_severity_high, variant: "warning" },
  critical: { label: m.activity_severity_critical, variant: "error" },
} satisfies Record<
  NonNullable<AuditLogEntry["severity"]>,
  { label: () => string; variant: BadgeVariant }
>

export function SeverityCell({ severity }: { severity: AuditLogEntry["severity"] }) {
  if (severity === null) {
    return null
  }

  return <Pill variant={SEVERITIES[severity].variant}>{SEVERITIES[severity].label()}</Pill>
}
