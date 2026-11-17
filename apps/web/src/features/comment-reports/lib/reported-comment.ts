import { getCommentText } from "@taiyomoe/schemas/comment-content"
import type { ReportedComment } from "@/features/comment-reports/api/comment-reports"
import { m } from "@/paraglide/messages"

export const REMOVAL_LABELS = {
  AUTHOR: m.comment_reports_removed_author,
  PAGE_OWNER: m.comment_reports_removed_owner,
  MODERATOR: m.comment_reports_removed_moderator,
  ACCOUNT_DELETED: m.comment_reports_removed_account,
  HIDDEN: m.comment_reports_removed_hidden,
} satisfies Record<NonNullable<ReportedComment["comment"]["removal"]>, () => string>

/** The comment as one line of plain text, without its formatting marks. */
export const getExcerpt = (entry: ReportedComment) =>
  getCommentText(entry.comment.originalContent)
    .replaceAll(/\*\*|__|~~|\|\|/g, "")
    .replaceAll(/\s+/g, " ")
    .trim()

/** The reasons given in the latest reports, each once. */
export const getReasons = (entry: ReportedComment) => [
  ...new Set(entry.reports.map((report) => report.reason)),
]
