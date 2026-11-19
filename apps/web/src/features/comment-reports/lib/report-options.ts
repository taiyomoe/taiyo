import {
  COMMENT_REPORT_REASONS,
  COMMENT_REPORT_STATUSES,
  type CommentReportReason,
  type CommentReportStatus,
} from "@taiyomoe/db/constants"
import {
  Activity,
  AlertTriangle,
  EyeOff,
  Flag,
  LegalDocument,
  Mail,
  MoreCircle,
  UserRemove,
} from "@taiyomoe/ui/components/icons"
import type { OptionIcon, OptionSet } from "@/components/fields/option-select"
import { statusDotIcon } from "@/components/fields/status-dot"
import { COMMENT_REPORT_REASON_LABELS } from "@/features/comments/lib/report-reasons"
import { m } from "@/paraglide/messages"

const ICONS: Record<CommentReportReason, OptionIcon> = {
  SPAM: Mail,
  HARASSMENT: UserRemove,
  SPOILER: EyeOff,
  NSFW: AlertTriangle,
  ILLEGAL: LegalDocument,
  OTHER: MoreCircle,
}

export const REPORT_REASON_OPTIONS: OptionSet<CommentReportReason> = {
  values: COMMENT_REPORT_REASONS,
  label: (reason) => COMMENT_REPORT_REASON_LABELS[reason](),
  icon: (reason) => ICONS[reason],
  fieldIcon: Flag,
}

const STATUSES = {
  OPEN: { label: m.comment_reports_status_open, icon: statusDotIcon("warning") },
  RESOLVED: { label: m.comment_reports_status_resolved, icon: statusDotIcon("success") },
  DISMISSED: { label: m.comment_reports_status_dismissed, icon: statusDotIcon("secondary") },
} satisfies Record<CommentReportStatus, { label: () => string; icon: OptionIcon }>

export const REPORT_STATUS_OPTIONS: OptionSet<CommentReportStatus> = {
  values: COMMENT_REPORT_STATUSES,
  label: (status) => STATUSES[status].label(),
  icon: (status) => STATUSES[status].icon,
  fieldIcon: Activity,
}
