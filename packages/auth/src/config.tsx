import type { DB, Kysely, Role, UserSettings } from "@taiyomoe/db"
import { kyselyAdapter } from "@better-auth/kysely-adapter"
import { cacheClient } from "@taiyomoe/cache"
import { config } from "@taiyomoe/config"
import { MagicLinkEmail, ResetPasswordEmail, resend, SignUpEmail } from "@taiyomoe/email"
import { createPermissions, toRole } from "@taiyomoe/permissions"
import { betterAuth } from "better-auth"
import { emailHarmony } from "better-auth-harmony"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { admin, captcha, customSession, magicLink, username } from "better-auth/plugins"
import { DateTime } from "luxon"
import { z } from "zod"
import { adminPluginRoles } from "./admin-roles"
import { clientEnv } from "./env/client"
import { serverEnv } from "./env/server"
import { afterHook } from "./utils/after-hook"
import { createBeforeUserCreatedHook } from "./utils/before-user-created-hook"
import { getSessionFromHeaders } from "./utils/get-session-from-headers"

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

export const captchaEndpoints = ["/sign-up/email", "/request-password-reset"]

export const rateLimitRules = {
  "/sign-in/email": { window: 60, max: 3 },
  "/sign-in/username": { window: 60, max: 3 },
  "/sign-in/magic-link": { window: 60, max: 1 },
  "/sign-up/email": { window: 120, max: 1 },
  "/request-password-reset": { window: 120, max: 1 },
}

export const createAuth = ({
  db,
  trustedOrigins = [],
}: {
  db: Kysely<DB>
  trustedOrigins?: string[]
}) =>
  betterAuth({
    appName: "Taiyō",
    baseURL: clientEnv.VITE_BETTER_AUTH_URL,
    trustedOrigins,
    database: kyselyAdapter(db, { type: "postgres", usePlural: true }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: config.auth.password.minLength,
      maxPasswordLength: config.auth.password.maxLength,
      requireEmailVerification: true,
      sendResetPassword: async (data) => {
        await resend.emails.send({
          from: "Taiyō <no-reply@taiyo.moe>",
          to: data.user.email,
          subject: "Reset your password",
          react: <ResetPasswordEmail name={data.user.name} url={data.url} />,
        })
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async (data) => {
        await resend.emails.send({
          from: "Taiyō <no-reply@taiyo.moe>",
          to: data.user.email,
          subject: "Verify your email",
          react: <SignUpEmail name={data.user.name} url={data.url} />,
        })
      },
    },
    account: { accountLinking: { enabled: false } },
    user: {
      additionalFields: { settings: { fieldName: "settings", type: "string", input: false } },
    },
    socialProviders: {
      discord: {
        clientId: serverEnv.DISCORD_CLIENT_ID,
        clientSecret: serverEnv.DISCORD_CLIENT_SECRET,
      },
      google: {
        clientId: serverEnv.GOOGLE_CLIENT_ID,
        clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
      },
    },
    secondaryStorage: {
      set: cacheClient.users.auth.set,
      get: cacheClient.users.auth.get,
      delete: cacheClient.users.auth.invalidate,
      getAndDelete: cacheClient.users.auth.getAndDelete,
      increment: cacheClient.users.auth.increment,
    },
    rateLimit: {
      enabled: true,
      storage: "secondary-storage",
      customRules: rateLimitRules,
    },
    session: { storeSessionInDatabase: true },
    advanced: { database: { generateId: "uuid" }, disableOriginCheck: false },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        const action = ADMIN_ACTIONS.get(ctx.path)

        if (action !== undefined) {
          const session = await getSessionFromHeaders(ctx)
          const actor = actorSchema.safeParse(session?.user)
          const body = adminBodySchema.safeParse(ctx.body)

          if (!actor.success) {
            return
          }

          if (!body.success) {
            throw new APIError("BAD_REQUEST", {
              code: "INVALID_USER_ID",
              message: "Invalid user id",
            })
          }

          const targetId =
            body.data.userId ??
            (body.data.sessionToken === undefined
              ? undefined
              : (await ctx.context.internalAdapter.findSession(body.data.sessionToken))?.session
                  .userId)
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

          const { email, username: handle, password } = body.data
          const identifier = email ?? handle

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
      }),
      after: afterHook,
    },
    databaseHooks: {
      user: {
        create: {
          before: createBeforeUserCreatedHook({ db }),
          after: async ({ id }) => {
            await db.insertInto("userProfiles").values({ userId: id }).execute()
          },
        },
      },
    },
    plugins: [
      username({
        minUsernameLength: config.auth.username.minLength,
        maxUsernameLength: config.auth.username.maxLength,
        usernameValidator: (input) => config.auth.username.regex.test(input),
      }),
      emailHarmony(),
      magicLink({
        disableSignUp: true,
        sendMagicLink: async (data) => {
          const user = await db
            .selectFrom("users")
            .selectAll()
            .where("email", "=", data.email)
            .executeTakeFirst()

          if (user === undefined || user.email === null || user.email === "") {
            throw new APIError("BAD_REQUEST", { message: "Failed to send magic link" })
          }

          await resend.emails.send({
            from: "Taiyō <no-reply@taiyo.moe>",
            to: user.email,
            subject: "Your magic link for Taiyō",
            react: <MagicLinkEmail name={user.name} url={data.url} />,
          })
        },
      }),
      captcha({
        provider: "cloudflare-turnstile",
        secretKey: serverEnv.TURNSTILE_SECRET_KEY,
        endpoints: captchaEndpoints,
      }),
      admin({ defaultRole: "USER", adminRoles: ["ADMIN"], roles: adminPluginRoles }),
      customSession(({ session, user }) =>
        Promise.resolve({
          session,
          user: {
            ...user,
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion
            ...(user as unknown as {
              username: string | null | undefined
              displayUsername: string | null | undefined
              banned: boolean | null | undefined
              banReason: string | null | undefined
              banExpires: Date | null | undefined
              role: Role
              settings: UserSettings
            }),
          },
        }),
      ),
    ],
  })

export type Auth = ReturnType<typeof createAuth>

export type User = Omit<Auth["$Infer"]["Session"]["user"], "settings"> & {
  role: Role
  settings: UserSettings
}

export type Session = Omit<Auth["$Infer"]["Session"], "user"> & {
  user: User
}
