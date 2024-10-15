import { db } from "@taiyomoe/db"

const isFollowing = async (userId: string, targetId: string) => {
  const result = await db.user.findUnique({
    select: { id: true },
    where: { id: userId, following: { some: { id: targetId } } },
  })

  return !!result
}

export const BaseUsersService = {
  isFollowing,
}
