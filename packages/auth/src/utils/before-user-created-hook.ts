import { normalizeDisplayName, normalizeUsername } from "@taiyomoe/utils"
import type { User } from "better-auth"

export const beforeUserCreatedHook = async (user: User) => {
  const normalizedUsername = normalizeUsername(user.name)
  const normalizedDisplayName = normalizeDisplayName(user.name)

  return {
    data: {
      ...user,
      name: normalizedDisplayName,
      username: normalizedUsername,
      displayUsername: normalizedDisplayName,
    },
  }
}
