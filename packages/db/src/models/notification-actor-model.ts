import type { Generated, Timestamp } from "../types"

export type NotificationActor = {
  notificationId: string
  actorId: string
  createdAt: Generated<Timestamp>
}
