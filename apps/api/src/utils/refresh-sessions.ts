import type { Auth } from "@taiyomoe/auth/server"

/**
 * Re-reads the user and rewrites their cached sessions, so fields the session
 * carries (avatar, name effect, settings) are fresh on the next request.
 */
export const refreshUserSessions = async (auth: Auth, userId: string) => {
  const { internalAdapter } = await auth.$context
  const user = await internalAdapter.findUserById(userId)

  if (user) {
    await internalAdapter.refreshUserSessions(user)
  }
}
