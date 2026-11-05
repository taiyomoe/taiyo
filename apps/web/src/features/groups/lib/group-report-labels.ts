import type { GroupReport } from "@/features/groups/api/groups"
import { m } from "@/paraglide/messages"

export const GROUP_REPORT_REASON_LABELS: Record<GroupReport["reason"], () => string> = {
  IMPERSONATION: m.group_report_reason_impersonation,
  STOLEN_WORK: m.group_report_reason_stolen_work,
  SPAM: m.group_report_reason_spam,
  OTHER: m.group_report_reason_other,
}
