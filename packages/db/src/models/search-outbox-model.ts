import type { Generated } from "kysely"
import type { Timestamp } from "../types"

export type SearchOutboxEntry = {
  id: Generated<string>
  mediaId: string
  createdAt: Generated<Timestamp>
}
