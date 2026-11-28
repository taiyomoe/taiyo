import type { DataExportStatus } from "../constants"
import type { Generated, Timestamp } from "../types"

export type DataExport = {
  id: Generated<string>
  userId: string
  status: Generated<DataExportStatus>
  byteSize: string | null
  createdAt: Generated<Timestamp>
  finishedAt: Timestamp | null
  expiresAt: Timestamp | null
}
