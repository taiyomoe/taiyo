import { createAuthMiddleware } from "better-auth/api"
import { getSessionFromHeaders } from "./get-session-from-headers"

export const afterHook = createAuthMiddleware(async (ctx) => {
  if (ctx.path === "/sign-out") {
    await getSessionFromHeaders(ctx)
  }
})
