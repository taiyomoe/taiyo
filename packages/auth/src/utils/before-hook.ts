import type { DB, Kysely } from "@taiyomoe/db"
import { cacheClient } from "@taiyomoe/cache"
import { createPermissions, toRole } from "@taiyomoe/permissions"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { DateTime } from "luxon"
import { z } from "zod"
import { getSessionFromHeaders } from "./get-session-from-headers"

const ADMIN_ACTIONS = new Map(
  Object.entries({
    "/admin/impersonate-user": "user.impersonate",
    "/admin/set-user-password": "user.setPassword",
    "/admin/list-user-sessions": "user.manageSessions",
    "/admin/revoke-user-sessions": "user.manageSessions",
    "/admin/revoke-user-session": "user.manageSessions",
  } as const),
)
const adminBodySchema = z.object({
  userId: z.uuid().optional(),
  sessionToken: z.string().optional(),
})
const actorSchema = z.object({ id: z.string(), role: z.unknown(), banned: z.boolean().nullish() })
const signInBodySchema = z.object({
  email: z.string().optional(),
  username: z.string().optional(),
  password: z.string(),
})
const createInvalidCredsError = (isEmail: boolean) =>
  new APIError("FORBIDDEN", {
    code: isEmail ? "INVALID_EMAIL_OR_PASSWORD" : "INVALID_USERNAME_OR_PASSWORD",
    message: isEmail ? "Invalid email or password" : "Invalid username or password",
  })

export const createBeforeHook = ({ db }: { db: Kysely<DB> }) =>
  createAuthMiddleware(async (ctx) => {
    const action = ADMIN_ACTIONS.get(ctx.path)

    if (action !== undefined) {
      const session = await getSessionFromHeaders(ctx)
      const actor = actorSchema.safeParse(session?.user)
      const body = adminBodySchema.safeParse(ctx.body)

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

      if (!can(action, target)) {
        throw new APIError("FORBIDDEN", {
          code: "FORBIDDEN_TARGET",
          message: "You can't do this for this user",
        })
      }

      return
    }

    if (ctx.path === "/sign-in/email" || ctx.path === "/sign-in/username") {
      const body = signInBodySchema.safeParse(ctx.body)

      if (!body.success) {
        return
      }

      const { email, username, password } = body.data
      const identifier = email ?? username

      if (identifier === undefined) {
        return
      }

      const user = await db
        .selectFrom("users")
        .selectAll()
        .where(email !== undefined && email !== "" ? "email" : "username", "=", identifier)
        .executeTakeFirst()

      if (!user) {
        return
      }

      const accounts = await db
        .selectFrom("accounts")
        .selectAll()
        .where("userId", "=", user.id)
        .execute()
      const hash = accounts.find((a) => a.providerId === "credential")?.password

      if (typeof hash !== "string") {
        throw createInvalidCredsError(email !== undefined)
      }

      const isCorrectPassword = await ctx.context.password.verify({
        password,
        hash,
      })

      if (!isCorrectPassword) {
        throw createInvalidCredsError(email !== undefined)
      }

      if (user.emailVerified) {
        return
      }

      const cacheController = cacheClient.users.verificationEmailSentAt
      const verificationEmailSentAt = await cacheController.get(user.id)

      if (verificationEmailSentAt) {
        const lastVerificationSentAt = DateTime.fromJSDate(verificationEmailSentAt)
        const timeLimit = DateTime.now().minus({ hours: 1 })

        if (lastVerificationSentAt > timeLimit) {
          throw new APIError("FORBIDDEN", {
            code: "VERIFICATION_EMAIL_ALREADY_SENT",
            message: "Verification email already sent",
          })
        }
      }

      await cacheController.set(user.id, new Date())
    }
  })
