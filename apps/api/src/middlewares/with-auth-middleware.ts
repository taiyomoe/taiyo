import type { Session, User } from "@taiyomoe/auth/server"
import {
  type Actor,
  allows,
  createPermissions,
  type Permissions,
  type StaticPermissionPath,
} from "@taiyomoe/permissions"
import { createMiddleware } from "hono/factory"
import { loadActor } from "../utils/actor"

export const withAuth = (path?: StaticPermissionPath) =>
  createMiddleware<{
    Variables: { user: User; session: Session["session"]; actor: Actor; can: Permissions }
  }>(async (c, next) => {
    const result = await c.var.auth.api.getSession({ headers: c.req.raw.headers })

    if (!result) {
      return c.fail("UNAUTHORIZED")
    }

    c.set("user", result.user)
    c.set("session", result.session)

    const actor = await loadActor(c.var.db, result.user.id)

    if (actor === null) {
      return c.fail("UNAUTHORIZED")
    }

    if (actor.banned || (path !== undefined && !allows(actor, path))) {
      return c.fail("FORBIDDEN")
    }

    c.set("actor", actor)
    c.set("can", createPermissions(actor))

    return next()
  })

export const withOptionalAuth = createMiddleware<{
  Variables: { viewer: Actor | null; can: Permissions }
}>(async (c, next) => {
  const result = await c.var.auth.api.getSession({ headers: c.req.raw.headers })
  const viewer = result ? await loadActor(c.var.db, result.user.id) : null

  c.set("viewer", viewer)
  c.set("can", createPermissions(viewer))

  return next()
})
