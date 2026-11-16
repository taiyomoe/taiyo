import type { MangaDexSyncStatus } from "../constants"
import type { MangaDexSyncSummary } from "../json-types"
import type { Generated, Timestamp } from "../types"

export type MangaDexSync = {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  finishedAt: Timestamp | null
  mediaId: string
  userId: string
  mangaDexId: string
  status: Generated<MangaDexSyncStatus>
  error: string | null
  summary: Generated<MangaDexSyncSummary>
}
