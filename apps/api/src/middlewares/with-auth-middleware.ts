import { Session, User } from "@taiyomoe/auth/server"
import { createMiddleware } from "hono/factory"
import { type Actions, defineAbilitiesFor, type Subjects } from "../utils/abilities"

/**
 * Resolves the better-auth session and enforces an ability check on it.
 *
 * Rejects with:
 *   - `UNAUTHORIZED` when there is no session at all
 *   - `FORBIDDEN` when the authenticated user lacks the required ability
 *
 * On success the user and session are exposed on the context.
 */
export const withAuth = (action: Actions, subject: Subjects) =>
  createMiddleware<{
    Variables: { user: User; session: Session["session"] }
  }>(async (c, next) => {
    const result = await c.var.auth.api.getSession({ headers: c.req.raw.headers })

    if (!result) {
      return c.fail("UNAUTHORIZED")
    }

    const ability = defineAbilitiesFor(result.user)

    if (ability.cannot(action, subject)) {
      return c.fail("FORBIDDEN")
    }

    c.set("user", result.user)
    c.set("session", result.session)

    await next()
  })
