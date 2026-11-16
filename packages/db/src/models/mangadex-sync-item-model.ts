import type { MangaDexSyncItemKind, MangaDexSyncItemStatus } from "../constants"
import type { MangaDexSyncItemDetails } from "../json-types"
import type { Generated, Timestamp } from "../types"

export type MangaDexSyncItem = {
  id: Generated<string>
  syncId: string
  position: number
  kind: MangaDexSyncItemKind
  mangaDexId: string
  details: MangaDexSyncItemDetails
  status: Generated<MangaDexSyncItemStatus>
  error: string | null
  entityId: string | null
  updatedAt: Generated<Timestamp>
}
