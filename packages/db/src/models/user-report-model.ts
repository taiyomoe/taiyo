import type { UserReportReason, UserReportStatus } from "../constants"
import type { Generated, Timestamp } from "../types"

export type UserReport = {
  id: Generated<string>
  userId: string
  reporterId: string
  reason: UserReportReason
  details: string | null
  status: Generated<UserReportStatus>
  reviewerId: string | null
  reviewerNote: string | null
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}
