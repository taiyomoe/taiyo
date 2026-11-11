import type { Insertable } from "kysely"
import type { GroupReportReason, GroupReportStatus } from "../constants"
import type { Generated, Timestamp } from "../types"

export type GroupReport = {
  id: Generated<string>
  groupId: string
  reporterId: string
  reason: GroupReportReason
  details: string | null
  status: Generated<GroupReportStatus>
  reviewerId: string | null
  reviewerNote: string | null
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}

export type NewGroupReport = Insertable<GroupReport>
