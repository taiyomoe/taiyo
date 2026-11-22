import type { CommentReportReason, CommentReportStatus } from "../constants"
import type { Generated, Timestamp } from "../types"

export type MediaReviewReport = {
  id: Generated<string>
  reviewId: string
  reporterId: string
  reason: CommentReportReason
  details: string | null
  status: Generated<CommentReportStatus>
  resolverId: string | null
  resolvedAt: Timestamp | null
  createdAt: Generated<Timestamp>
}
