import { db } from "@taiyomoe/db"
import type { UserLimited } from "@taiyomoe/types"

const getLimited = async (userId: string): Promise<UserLimited | null> => {
  const result = await db.user.findUnique({
    select: {
      id: true,
      createdAt: true,
      image: true,
      name: true,
      role: true,
      settings: { select: { showFollowing: true, showLibrary: true } },
      profile: {
        select: {
          banner: true,
          birthDate: true,
          gender: true,
          city: true,
          country: true,
          about: true,
          points: true,
        },
      },
      _count: {
        select: {
          uploadedMediaChapters: true,
          followers: true,
          following: true,
        },
      },
    },
    where: { id: userId },
  })

  if (!result || !result.settings || !result.profile) return null

  return {
    ...result,
    settings: result.settings,
    profile: result.profile,
    uploadsCount: result._count.uploadedMediaChapters,
    followersCount: result._count.followers,
    followingCount: result._count.following,
  }
}

const isFollowing = async (userId: string, targetId: string) => {
  const result = await db.user.findUnique({
    select: { id: true },
    where: { id: userId, following: { some: { id: targetId } } },
  })

  return !!result
}

export const UsersService = {
  getLimited,
  isFollowing,
}
