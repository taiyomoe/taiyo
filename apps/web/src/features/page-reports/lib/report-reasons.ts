import type { PageReportReason } from "@taiyomoe/db/constants"
import { m } from "@/paraglide/messages"

export const REPORT_REASON_LABELS: Record<PageReportReason, () => string> = {
  BROKEN: m.reader_report_reason_broken,
  WRONG_ORDER: m.reader_report_reason_wrong_order,
  WRONG_CHAPTER: m.reader_report_reason_wrong_chapter,
  LOW_QUALITY: m.reader_report_reason_low_quality,
  OTHER: m.reader_report_reason_other,
}
