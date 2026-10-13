import type { DB, Kysely } from "@taiyomoe/db"
import { cacheClient } from "@taiyomoe/cache"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { DateTime } from "luxon"
import { z } from "zod"

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
