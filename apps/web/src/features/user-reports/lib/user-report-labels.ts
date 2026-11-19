import { USER_REPORT_REASONS, type UserReportReason } from "@taiyomoe/db/constants"
import {
  AlertTriangle,
  Flag,
  Mail,
  MoreCircle,
  UserRemove,
  Users,
} from "@taiyomoe/ui/components/icons"
import type { OptionSet } from "@/components/fields/option-select"
import { m } from "@/paraglide/messages"

const REASONS = {
  INAPPROPRIATE_PROFILE: { label: m.user_report_reason_inappropriate, icon: AlertTriangle },
  IMPERSONATION: { label: m.user_report_reason_impersonation, icon: Users },
  HARASSMENT: { label: m.user_report_reason_harassment, icon: UserRemove },
  SPAM: { label: m.user_report_reason_spam, icon: Mail },
  OTHER: { label: m.user_report_reason_other, icon: MoreCircle },
} satisfies Record<UserReportReason, unknown>

export const USER_REPORT_REASON_OPTIONS: OptionSet<UserReportReason> = {
  values: USER_REPORT_REASONS,
  label: (reason) => REASONS[reason].label(),
  icon: (reason) => REASONS[reason].icon,
  fieldIcon: Flag,
}
