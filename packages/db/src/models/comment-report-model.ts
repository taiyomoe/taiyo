import type { Insertable } from "kysely"
import type { CommentReportReason, CommentReportStatus } from "../constants"
import type { Generated, Timestamp } from "../types"

export type CommentReport = {
  id: Generated<string>
  commentId: string
  reporterId: string
  reason: CommentReportReason
  details: string | null
  status: Generated<CommentReportStatus>
  resolverId: string | null
  resolvedAt: Timestamp | null
  createdAt: Generated<Timestamp>
}

export type NewCommentReport = Insertable<CommentReport>
