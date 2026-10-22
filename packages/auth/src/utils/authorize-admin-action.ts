import type { DB, Kysely } from "@taiyomoe/db"
import type { HookEndpointContext } from "better-auth"
import { createPermissions, toRole } from "@taiyomoe/permissions"
import { APIError } from "better-auth/api"
import { z } from "zod"
import { getSessionFromHeaders } from "./get-session-from-headers"

const ACTIONS = {
  "/admin/impersonate-user": "user.impersonate",
  "/admin/set-user-password": "user.setPassword",
  "/admin/list-user-sessions": "user.manageSessions",
  "/admin/revoke-user-sessions": "user.manageSessions",
  "/admin/revoke-user-session": "user.manageSessions",
} as const

type AdminActionPath = keyof typeof ACTIONS
type AdminActionContext = Pick<HookEndpointContext, "context" | "body" | "path"> & {
  request?: Request | undefined
}

const bodySchema = z.object({ userId: z.uuid().optional(), sessionToken: z.string().optional() })
const actorSchema = z.object({ id: z.string(), role: z.unknown(), banned: z.boolean().nullish() })

export const isAdminAction = (path: string): path is AdminActionPath => Object.hasOwn(ACTIONS, path)

export const authorizeAdminAction = async (
  db: Kysely<DB>,
  path: AdminActionPath,
  ctx: AdminActionContext,
) => {
  const session = await getSessionFromHeaders(ctx)
  const actor = actorSchema.safeParse(session?.user)
  const body = bodySchema.safeParse(ctx.body)

  if (!actor.success) {
    return
  }

  if (!body.success) {
    throw new APIError("BAD_REQUEST", { code: "INVALID_USER_ID", message: "Invalid user id" })
  }

  const targetId =
    body.data.userId ??
    (body.data.sessionToken === undefined
      ? undefined
      : (await ctx.context.internalAdapter.findSession(body.data.sessionToken))?.session.userId)
  const target =
    targetId === undefined
      ? undefined
      : await db
          .selectFrom("users")
          .select(["id", "role"])
          .where("id", "=", targetId)
          .executeTakeFirst()

  if (target === undefined) {
    return
  }

  const can = createPermissions({
    id: actor.data.id,
    role: toRole(actor.data.role),
    banned: actor.data.banned === true,
    memberships: [],
  })

  if (!can(ACTIONS[path], target)) {
    throw new APIError("FORBIDDEN", {
      code: "FORBIDDEN_TARGET",
      message: "You can't do this for this user",
    })
  }
}
