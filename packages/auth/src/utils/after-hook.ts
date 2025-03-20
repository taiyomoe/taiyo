import { createAuthMiddleware } from "better-auth/api"
import { getSessionFromHeaders } from "./get-session-from-headers"

export const afterHook = createAuthMiddleware(async (ctx) => {
  if (ctx.path === "/sign-out") {
    const session = await getSessionFromHeaders(ctx)

    if (!session) return

    // await logsClient.users.auth.insert({
    //   type: "signedOut",
    //   ip: session.session.ipAddress,
    //   userId: session.user.id,
    // })
  }
})
