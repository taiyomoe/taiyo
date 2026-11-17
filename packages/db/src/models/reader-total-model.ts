import type { ReaderTotalKind } from "../rankings"
import type { Timestamp } from "../types"

export type ReaderTotal = {
  kind: ReaderTotalKind
  startsAt: Timestamp
  userId: string
  chapters: number
  pages: number
  lastAt: Timestamp
}
