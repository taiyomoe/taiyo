import type { BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
import { Activity, Copy, Flag, Mail, MoreCircle, Users } from "@taiyomoe/ui/components/icons"
import type { OptionSet } from "@/components/fields/option-select"
import type { GroupReport } from "@/features/groups/api/groups"
import { statusDotIcon } from "@/components/fields/status-dot"
import { m } from "@/paraglide/messages"

const REASONS = {
  IMPERSONATION: { label: m.group_report_reason_impersonation, icon: Users },
  STOLEN_WORK: { label: m.group_report_reason_stolen_work, icon: Copy },
  SPAM: { label: m.group_report_reason_spam, icon: Mail },
  OTHER: { label: m.group_report_reason_other, icon: MoreCircle },
} satisfies Record<GroupReport["reason"], unknown>
const STATUSES = {
  PENDING: { label: m.group_reports_status_pending, variant: "warning" },
  RESOLVED: { label: m.group_reports_status_resolved, variant: "success" },
  DISMISSED: { label: m.group_reports_status_dismissed, variant: "outline" },
} satisfies Record<GroupReport["status"], { label: () => string; variant: BadgeVariant }>

export const GROUP_REPORT_REASON_LABELS: Record<GroupReport["reason"], () => string> = {
  IMPERSONATION: REASONS.IMPERSONATION.label,
  STOLEN_WORK: REASONS.STOLEN_WORK.label,
  SPAM: REASONS.SPAM.label,
  OTHER: REASONS.OTHER.label,
}

export const GROUP_REPORT_REASON_OPTIONS: OptionSet<GroupReport["reason"]> = {
  values: ["IMPERSONATION", "STOLEN_WORK", "SPAM", "OTHER"],
  label: (reason) => REASONS[reason].label(),
  icon: (reason) => REASONS[reason].icon,
  fieldIcon: Flag,
}

export const GROUP_REPORT_STATUS_OPTIONS: OptionSet<GroupReport["status"]> = {
  values: ["PENDING", "RESOLVED", "DISMISSED"],
  label: (status) => STATUSES[status].label(),
  icon: (status) => statusDotIcon(STATUSES[status].variant),
  fieldIcon: Activity,
}

export const groupReportStatusVariant = (status: GroupReport["status"]) => STATUSES[status].variant
