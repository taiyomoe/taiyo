import type { HookEndpointContext } from "better-auth"
import { parseCookies } from "better-auth/cookies"

export const getSessionFromHeaders = (
  ctx: Pick<HookEndpointContext, "context"> & { request?: Request | undefined },
) => {
  const cookies = ctx.request?.headers.get("Cookie") ?? ""

  if (cookies === "") {
    return null
  }

  const sessionToken = parseCookies(cookies)
    .get(ctx.context.authCookies.sessionToken.name)
    ?.split(".")[0]

  if (sessionToken === undefined || sessionToken === "") {
    return null
  }

  return ctx.context.internalAdapter.findSession(sessionToken)
}
