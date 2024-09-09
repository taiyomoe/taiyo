import { sessionSchema } from "@taiyomoe/schemas"
import type { ForgedPermission } from "@taiyomoe/types"
import { PermissionUtils } from "@taiyomoe/utils"
import { Elysia } from "elysia"
import { env } from "../env"
import { UnauthorizedError } from "../utils/errors"

export const authMiddleware = (perms: ForgedPermission[] = []) =>
  new Elysia({ name: "Middleware.Auth" }).derive(
    { as: "scoped" },
    async ({ request }) => {
      const cookies = request.headers.get("cookie")

      if (!cookies) {
        throw new UnauthorizedError()
      }

      const session = await fetch(`${env.NEXTAUTH_URL}/api/auth/session`, {
        headers: { Cookie: cookies },
      })
        .then(async (res) => {
          const session = await res.json()
          const parsedSession = sessionSchema.parse(session)

          return parsedSession
        })
        .catch(() => null)

      if (
        !session ||
        !PermissionUtils.hasPermission(session.user.role.permissions, perms)
      ) {
        throw new UnauthorizedError()
      }

      return { session }
    },
  )
