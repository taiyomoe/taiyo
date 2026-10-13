import { normalizeDisplayName, normalizeUsername } from "@taiyomoe/utils"
import type { User } from "better-auth"

export const beforeUserCreatedHook = (user: User) => {
  const normalizedUsername = normalizeUsername(user.name)
  const normalizedDisplayName = normalizeDisplayName(user.name)

  return Promise.resolve({
    data: {
      ...user,
      name: normalizedDisplayName,
      username: normalizedUsername,
      displayUsername: normalizedDisplayName,
    },
  })
}
