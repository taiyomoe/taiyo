import { z } from "zod"
import { NOTIFICATION_CATEGORIES } from "@/features/notifications/api/notifications"

export const NOTIFICATIONS_PER_PAGE = 20

export const notificationsSearchSchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
  category: z.enum(NOTIFICATION_CATEGORIES).optional().catch(undefined),
  unread: z.boolean().optional().catch(undefined),
  q: z.string().trim().max(100).optional().catch(undefined),
})

export type NotificationsSearch = z.infer<typeof notificationsSearchSchema>
