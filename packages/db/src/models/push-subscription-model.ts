import type { Locale } from "../constants"
import type { Generated, Timestamp } from "../types"

export type PushSubscription = {
  id: Generated<string>
  userId: string
  sessionId: string
  endpoint: string
  p256dh: string
  auth: string
  userAgent: string | null
  locale: Generated<Locale>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}
