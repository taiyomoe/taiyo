import type { Generated, Timestamp } from "../types"

export type SearchOutboxEntry = {
  id: Generated<string>
  mediaId: string
  createdAt: Generated<Timestamp>
}
