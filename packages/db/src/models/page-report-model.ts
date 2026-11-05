import type { Insertable } from "kysely"
import type { PageReportReason, PageReportStatus } from "../constants"
import type { Generated, Timestamp } from "../types"

export type PageReport = {
  id: Generated<string>
  reporterId: string
  chapterId: string
  pageId: string
  reason: PageReportReason
  comment: string | null
  status: Generated<PageReportStatus>
  resolverId: string | null
  resolvedAt: Timestamp | null
  createdAt: Generated<Timestamp>
}

export type NewPageReport = Insertable<PageReport>
