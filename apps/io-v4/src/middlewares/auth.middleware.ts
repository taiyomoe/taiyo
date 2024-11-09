import type { Session } from "@taiyomoe/auth"
import { sessionSchema } from "@taiyomoe/schemas"
import type { ForgedPermission } from "@taiyomoe/types"
import { PermissionUtils } from "@taiyomoe/utils"
import { createMiddleware } from "hono/factory"
import { env } from "~/env"
import type { AuthMiddleware } from "~/types"
import { HttpError } from "~/utils/http-error"

export const withAuth = (perms: ForgedPermission[] = []) =>
  createMiddleware<AuthMiddleware>(async (c, next) => {
    const cookies = c.req.header("Cookie")

    if (!cookies) {
      throw new HttpError(401, "unauthorized")
    }

    const session = await fetch(`${env.AUTH_URL}/api/auth/session`, {
      headers: { Cookie: cookies },
    })
      .then(async (res) => {
        const session = await res.json()
        const parsedSession = sessionSchema.parse(session)

        return parsedSession as Session
      })
      .catch(() => null)

    if (
      !session ||
      !PermissionUtils.hasPermission(session.user.role.permissions, perms)
    ) {
      throw new HttpError(401, "unauthorized")
    }

    c.set("session", session.user)

    await next()
  })
