import type { NotificationType } from "../constants"
import type { NotificationPayload } from "../json-types"
import type { Generated, Timestamp } from "../types"

export type Notification = {
  id: Generated<string>
  userId: string
  type: NotificationType
  chapterId: string | null
  commentId: string | null
  rankingResultId: string | null
  achievement: string | null
  payload: NotificationPayload | null
  createdAt: Generated<Timestamp>
  lastEventAt: Generated<Timestamp>
  readAt: Timestamp | null
  pushedAt: Timestamp | null
}
