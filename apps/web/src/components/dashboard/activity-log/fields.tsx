import type { AuditLogField, AuditLogFieldType } from "@taiyomoe/audit/query"
import * as stylex from "@stylexjs/stylex"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { KqlSuggestion } from "@/components/dashboard/activity-log/kql-suggestions"
import { m } from "@/paraglide/messages"

const FIELD_DESCRIPTIONS: Record<string, () => string> = {
  action: m.activity_field_action,
  category: m.activity_field_category,
  outcome: m.activity_field_outcome,
  severity: m.activity_field_severity,
  actor: m.activity_field_actor,
  "actor.id": m.activity_field_actor_id,
  "actor.type": m.activity_field_actor_type,
  "actor.impersonating": m.activity_field_actor_impersonating,
  target: m.activity_field_target,
  "target.type": m.activity_field_target_type,
  "target.id": m.activity_field_target_id,
  changed: m.activity_field_changed,
  reason: m.activity_field_reason,
  ip: m.activity_field_ip,
  userAgent: m.activity_field_user_agent,
  requestId: m.activity_field_request_id,
  method: m.activity_field_method,
  path: m.activity_field_path,
  status: m.activity_field_status,
  timestamp: m.activity_field_timestamp,
  id: m.activity_field_id,
}
const OPERATOR_DESCRIPTIONS: Record<string, () => string> = {
  ":": m.activity_operator_matches,
  "<": m.activity_operator_lt,
  "<=": m.activity_operator_lte,
  ">": m.activity_operator_gt,
  ">=": m.activity_operator_gte,
}

export const describeField = (field: AuditLogField) =>
  FIELD_DESCRIPTIONS[field.name]?.() ?? m.activity_field_target_extra()

export const describeOperator = (operator: string) =>
  OPERATOR_DESCRIPTIONS[operator]?.() ?? operator

const TYPE_GLYPHS: Record<AuditLogFieldType, string> = {
  keyword: "k",
  text: "t",
  enum: "e",
  number: "#",
  date: "d",
}
const styles = stylex.create({
  chip: {
    borderRadius: radius.sm,
    alignItems: "center",
    display: "inline-flex",
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    fontWeight: 700,
    justifyContent: "center",
    lineHeight: 1,
    height: "1.25rem",
    width: "1.25rem",
  },
  keyword: {
    backgroundColor: `color-mix(in srgb, ${colors.info} 16%, transparent)`,
    color: colors.info,
  },
  text: {
    backgroundColor: `color-mix(in srgb, ${colors.chart2} 16%, transparent)`,
    color: colors.chart2,
  },
  enum: {
    backgroundColor: `color-mix(in srgb, ${colors.chart3} 16%, transparent)`,
    color: colors.chart3,
  },
  number: {
    backgroundColor: `color-mix(in srgb, ${colors.chart5} 18%, transparent)`,
    color: colors.chart5,
  },
  date: {
    backgroundColor: `color-mix(in srgb, ${colors.chart4} 16%, transparent)`,
    color: colors.chart4,
  },
  operator: {
    backgroundColor: colors.muted,
    color: colors.mutedForeground,
  },
  keywordToken: {
    backgroundColor: `color-mix(in srgb, ${colors.chart3} 16%, transparent)`,
    color: colors.chart3,
  },
})

export function FieldTypeChip({
  type,
  kind = "field",
}: {
  type: AuditLogFieldType | null
  kind?: KqlSuggestion["kind"]
}) {
  if (kind === "keyword") {
    return (
      <span aria-hidden sx={[styles.chip, styles.keywordToken]}>
        ⋯
      </span>
    )
  }

  if (kind === "operator" || type === null) {
    return (
      <span aria-hidden sx={[styles.chip, styles.operator]}>
        =
      </span>
    )
  }

  return (
    <span aria-hidden sx={[styles.chip, styles[type]]}>
      {kind === "value" ? "·" : TYPE_GLYPHS[type]}
    </span>
  )
}
