import { serverEnv as authEnv } from "@taiyomoe/auth/env-server"
import type { Role } from "@taiyomoe/db"
import { createHmac, randomBytes, randomUUID } from "node:crypto"
import type { Services } from "../../services"

const SESSION_COOKIE_NAME = "better-auth.session_token"

type SignInOptions = {
  role?: Role
  banned?: boolean
  email?: string
}

export const signInAs = async (
  { db }: Services,
  { role = "USER", banned = false, email }: SignInOptions = {},
) => {
  const userId = randomUUID()
  const handle = `u${userId.replace(/-/g, "").slice(0, 12)}`
  const sessionToken = randomBytes(32).toString("hex")
  const finalEmail = email ?? `${handle}@test.local`

  await db
    .insertInto("users")
    .values({
      id: userId,
      name: handle,
      email: finalEmail,
      normalizedEmail: finalEmail.toLowerCase(),
      emailVerified: true,
      username: handle,
      displayUsername: handle,
      role,
      banned,
    })
    .execute()

  await db
    .insertInto("sessions")
    .values({
      userId,
      token: sessionToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })
    .execute()

  const signature = createHmac("sha256", authEnv.BETTER_AUTH_SECRET)
    .update(sessionToken)
    .digest("base64")
  const cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(`${sessionToken}.${signature}`)}`

  return { userId, headers: { Cookie: cookie } }
}
