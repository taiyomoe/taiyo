import type { CommentReportReason } from "@taiyomoe/db/constants"
import { m } from "@/paraglide/messages"

export const COMMENT_REPORT_REASON_LABELS = {
  SPAM: m.comments_report_reason_spam,
  HARASSMENT: m.comments_report_reason_harassment,
  SPOILER: m.comments_report_reason_spoiler,
  NSFW: m.comments_report_reason_nsfw,
  ILLEGAL: m.comments_report_reason_illegal,
  OTHER: m.comments_report_reason_other,
} satisfies Record<CommentReportReason, () => string>
