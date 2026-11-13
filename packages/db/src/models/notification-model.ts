import type { Insertable } from "kysely"
import type { NotificationType } from "../constants"
import type { Generated, Timestamp } from "../types"

export type Notification = {
  id: Generated<string>
  userId: string
  type: NotificationType
  chapterId: string | null
  commentId: string | null
  createdAt: Generated<Timestamp>
  lastEventAt: Generated<Timestamp>
  readAt: Timestamp | null
  pushedAt: Timestamp | null
}

export type NewNotification = Insertable<Notification>
