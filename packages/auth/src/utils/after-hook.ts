import { createAuthMiddleware } from "better-auth/api"
import { signedOutHandler } from "../handlers/signed-out.auth-handler"
import { getSessionFromHeaders } from "./get-session-from-headers"

export const afterHook = createAuthMiddleware(async (ctx) => {
  if (ctx.path === "/sign-out") {
    const session = await getSessionFromHeaders(ctx)

    if (!session) return

    return signedOutHandler(session.user.id, session.session.ipAddress)
  }
})
