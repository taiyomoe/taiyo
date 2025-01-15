import { cacheClient } from "@taiyomoe/cache"
import { type User, db } from "@taiyomoe/db"
import type { User as BetterAuthUser, Session } from "better-auth"

export const getCustomSession = async ({
  user,
  session,
}: { user: BetterAuthUser; session: Session }) => {
  const cacheController = cacheClient.users.settings
  const cached = await cacheController.get(user.id)

  if (cached) {
    return {
      user: { ...(user as unknown as User), settings: cached },
      session,
    }
  }

  const settings = await db.userSetting.findUnique({
    select: {
      contentRating: true,
      preferredTitles: true,
      showFollowing: true,
      showLibrary: true,
      homeLayout: true,
    },
    where: { userId: user.id },
  })

  void cacheController.set(user.id, settings!)

  return {
    user: { ...(user as unknown as User), settings: settings! },
    session,
  }
}
