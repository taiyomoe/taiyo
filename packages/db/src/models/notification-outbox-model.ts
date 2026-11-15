import type { Generated, Timestamp } from "../types"

export type NotificationOutboxEntry = {
  id: Generated<string>
  chapterId: string
  createdAt: Generated<Timestamp>
}
