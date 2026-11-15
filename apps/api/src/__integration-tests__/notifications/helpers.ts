import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { seedMedia } from "../helpers/seed"

export const resetNotificationOutbox = async ({ db }: Services) => {
  await db.deleteFrom("notificationOutbox").execute()
}

export const readNotificationOutbox = async ({ db }: Services) => {
  const rows = await db.selectFrom("notificationOutbox").select("chapterId").orderBy("id").execute()

  return rows.map((row) => row.chapterId)
}

export const readNotifiedUsers = async ({ db }: Services, chapterId: string) => {
  const rows = await db
    .selectFrom("notifications")
    .select("userId")
    .where("chapterId", "=", chapterId)
    .orderBy("userId")
    .execute()

  return rows.map((row) => row.userId)
}

export const setupMedia = async (services: Services) => {
  const uploader = await signInAs(services, { role: "ADMIN" })
  const mediaId = await seedMedia(services, uploader.userId)

  await resetNotificationOutbox(services)

  return { uploader, mediaId }
}
