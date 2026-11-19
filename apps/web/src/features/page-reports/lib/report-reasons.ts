import type { BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
import {
  PAGE_REPORT_REASONS,
  PAGE_REPORT_STATUSES,
  type PageReportReason,
  type PageReportStatus,
} from "@taiyomoe/db/constants"
import {
  Activity,
  ArrowUpDown,
  EyeOff,
  Flag,
  ImageMissing,
  ListNumbered,
  MoreCircle,
} from "@taiyomoe/ui/components/icons"
import type { OptionSet } from "@/components/fields/option-select"
import { statusDotIcon } from "@/components/fields/status-dot"
import { m } from "@/paraglide/messages"

/** What the reader picks when reporting a page, in full. */
export const REPORT_REASON_LABELS: Record<PageReportReason, () => string> = {
  BROKEN: m.reader_report_reason_broken,
  WRONG_ORDER: m.reader_report_reason_wrong_order,
  WRONG_CHAPTER: m.reader_report_reason_wrong_chapter,
  LOW_QUALITY: m.reader_report_reason_low_quality,
  OTHER: m.reader_report_reason_other,
}

const REASON_SHORT_LABELS: Record<PageReportReason, () => string> = {
  BROKEN: m.page_reports_reason_broken,
  WRONG_ORDER: m.page_reports_reason_wrong_order,
  WRONG_CHAPTER: m.page_reports_reason_wrong_chapter,
  LOW_QUALITY: m.page_reports_reason_low_quality,
  OTHER: m.page_reports_reason_other,
}
const REASON_ICONS = {
  BROKEN: ImageMissing,
  WRONG_ORDER: ArrowUpDown,
  WRONG_CHAPTER: ListNumbered,
  LOW_QUALITY: EyeOff,
  OTHER: MoreCircle,
} satisfies Record<PageReportReason, unknown>

export const REPORT_REASON_OPTIONS: OptionSet<PageReportReason> = {
  values: PAGE_REPORT_REASONS,
  label: (reason) => REASON_SHORT_LABELS[reason](),
  icon: (reason) => REASON_ICONS[reason],
  fieldIcon: Flag,
}

export const REPORT_STATUS: Record<
  PageReportStatus,
  { label: () => string; variant: BadgeVariant }
> = {
  OPEN: { label: m.page_reports_status_open, variant: "warning" },
  RESOLVED: { label: m.page_reports_status_resolved, variant: "success" },
  DISMISSED: { label: m.page_reports_status_dismissed, variant: "secondary" },
}

export const REPORT_STATUS_OPTIONS: OptionSet<PageReportStatus> = {
  values: PAGE_REPORT_STATUSES,
  label: (status) => REPORT_STATUS[status].label(),
  icon: (status) => statusDotIcon(REPORT_STATUS[status].variant),
  fieldIcon: Activity,
}
