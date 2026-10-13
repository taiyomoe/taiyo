import type { Generated } from "kysely"
import type { GeneratedTimestamp } from "../types"

export type SearchOutboxEntry = {
  id: Generated<string>
  mediaId: string
  createdAt: GeneratedTimestamp
}
