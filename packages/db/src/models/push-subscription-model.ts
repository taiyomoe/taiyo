import type { Insertable } from "kysely"
import type { Generated, Timestamp } from "../types"

export type PushSubscription = {
  id: Generated<string>
  userId: string
  sessionId: string
  endpoint: string
  p256dh: string
  auth: string
  userAgent: string | null
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}

export type NewPushSubscription = Insertable<PushSubscription>
