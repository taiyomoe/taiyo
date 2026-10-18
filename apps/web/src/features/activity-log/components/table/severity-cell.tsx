import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { AuditLogEntry } from "@/features/activity-log/api/audit-logs"
import { m } from "@/paraglide/messages"

const SEVERITY_LABELS = {
  low: m.activity_severity_low,
  medium: m.activity_severity_medium,
  high: m.activity_severity_high,
  critical: m.activity_severity_critical,
}
const SEVERITY_TONES = {
  low: colors.mutedForeground,
  medium: colors.info,
  high: colors.warning,
  critical: colors.destructive,
}
const styles = stylex.create({
  severity: {
    gap: "0.5rem",
    alignItems: "center",
    display: "inline-flex",
    fontSize: "0.8125rem",
    whiteSpace: "nowrap",
  },
  dot: (color: string) => ({
    borderRadius: radius.full,
    backgroundColor: color,
    flexShrink: 0,
    height: "0.5rem",
    width: "0.5rem",
  }),
})

export function SeverityCell({ severity }: { severity: AuditLogEntry["severity"] }) {
  if (severity === null) {
    return null
  }

  return (
    <span sx={styles.severity}>
      <span sx={styles.dot(SEVERITY_TONES[severity])} />
      {SEVERITY_LABELS[severity]()}
    </span>
  )
}
