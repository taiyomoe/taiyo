import type { DB, Kysely, Role, UserSettings } from "@taiyomoe/db"
import { kyselyAdapter } from "@better-auth/kysely-adapter"
import { cacheClient } from "@taiyomoe/cache"
import { config } from "@taiyomoe/config"
import { createPermissions, toRole } from "@taiyomoe/permissions"
import { betterAuth } from "better-auth"
import { emailHarmony } from "better-auth-harmony"
import { APIError, createAuthMiddleware, getAuthoritativeSessionFromCtx } from "better-auth/api"
import {
  admin,
  captcha,
  customSession,
  lastLoginMethod,
  magicLink,
  twoFactor,
  username,
} from "better-auth/plugins"
import { DateTime } from "luxon"
import { z } from "zod"
import { adminPluginRoles } from "./admin-roles"
import { clientEnv } from "./env/client"
import { serverEnv } from "./env/server"
import { afterHook } from "./utils/after-hook"
import {
  createBeforeUserCreatedHook,
  isUnverifiedSocialSignUp,
} from "./utils/before-user-created-hook"

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
const cookieDomain = serverEnv.BETTER_AUTH_COOKIE_DOMAIN ?? ""
const unlinkAccountBodySchema = z.object({ accountId: z.string() })
const deleteUserBodySchema = z.object({
  password: z.string().optional(),
  token: z.string().optional(),
})
const signInBodySchema = z.object({
  email: z.string().optional(),
  username: z.string().optional(),
  password: z.string(),
})
// The same status and body Better Auth returns for an unknown account, so a failed sign-in does
// not tell whether the email or username is registered.
const createInvalidCredsError = (isEmail: boolean) =>
  APIError.from("UNAUTHORIZED", {
    code: isEmail ? "INVALID_EMAIL_OR_PASSWORD" : "INVALID_USERNAME_OR_PASSWORD",
    message: isEmail ? "Invalid email or password" : "Invalid username or password",
  })

/** @internal Exported for its tests. */
export const captchaEndpoints = ["/sign-up/email", "/request-password-reset"]

/** @internal Exported for its tests. */
export const rateLimitRules = {
  "/sign-in/email": { window: 60, max: 3 },
  "/sign-in/username": { window: 60, max: 3 },
  "/sign-in/magic-link": { window: 60, max: 1 },
  "/sign-up/email": { window: 120, max: 1 },
  "/request-password-reset": { window: 120, max: 1 },
}

type AuthEmailBase = { to: string; name: string; url: string }

/** The emails Better Auth asks for. The app renders and sends them, so auth stays free of templates. */
export type AuthEmail =
  | (AuthEmailBase & { kind: "reset-password" })
  | (AuthEmailBase & { kind: "verify-email" })
  | (AuthEmailBase & { kind: "change-email"; newEmail: string })
  | (AuthEmailBase & { kind: "magic-link" })
  | (AuthEmailBase & { kind: "delete-account"; expiresInMinutes: number })
  | { kind: "account-deleted"; to: string; name: string }

/** What deleting an account needs from the app. Without it, accounts cannot be deleted. */
export type AccountDeletion = {
  /** The code of what keeps the user from deleting their account now, or null. */
  getBlocker: (userId: string) => Promise<string | null>
  /** The web page that asks the user to confirm, from the token in the emailed link. */
  getConfirmUrl: (token: string) => string
  /**
   * Deletes the account and everything that belongs to it, in one transaction, unless something
   * now keeps it from being deleted: then nothing changes and the code of that blocker is returned.
   */
  deleteAccount: (userId: string) => Promise<string | null>
  /** Cleans up outside the database once the account is gone. */
  afterDelete: (userId: string) => Promise<void>
}

export const createAuth = ({
  db,
  trustedOrigins = [],
  sendEmail,
  accountDeletion,
}: {
  db: Kysely<DB>
  trustedOrigins?: string[]
  sendEmail: (email: AuthEmail) => Promise<void>
  accountDeletion?: AccountDeletion
}) =>
  betterAuth({
    appName: "Taiyō",
    baseURL: clientEnv.VITE_BETTER_AUTH_URL,
    trustedOrigins,
    // Profile edits go through /users/me/account and /users/me/avatar, which enforce the display
    // name policy and the owned-avatar rule that Better Auth's generic endpoint would skip.
    // The emailed deletion link opens a web page that asks before calling POST /delete-user: a
    // GET that deletes would run for any mail scanner that opens the link.
    disabledPaths: ["/update-user", "/delete-user/callback"],
    database: kyselyAdapter(db, { type: "postgres", usePlural: true }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: config.auth.password.minLength,
      maxPasswordLength: config.auth.password.maxLength,
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async (data) => {
        await sendEmail({
          kind: "reset-password",
          to: data.user.email,
          name: data.user.name,
          url: data.url,
        })
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      // The sign-in hook below lets an unverified sign-in through once an hour, to resend the link.
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async (data) => {
        await sendEmail({
          kind: "verify-email",
          to: data.user.email,
          name: data.user.name,
          url: data.url,
        })
      },
    },
    account: {
      accountLinking: { enabled: true, disableImplicitLinking: true, allowDifferentEmails: true },
    },
    user: {
      changeEmail: {
        enabled: true,
        sendChangeEmailConfirmation: async (data) => {
          await sendEmail({
            kind: "change-email",
            to: data.user.email,
            name: data.user.name,
            newEmail: data.newEmail,
            url: data.url,
          })
        },
      },
      deleteUser:
        accountDeletion === undefined
          ? { enabled: false }
          : {
              enabled: true,
              deleteTokenExpiresIn: config.auth.deleteAccountLinkTtlSeconds,
              sendDeleteAccountVerification: async ({ user, token }) => {
                await sendEmail({
                  kind: "delete-account",
                  to: user.email,
                  name: user.name,
                  url: accountDeletion.getConfirmUrl(token),
                  expiresInMinutes: config.auth.deleteAccountLinkTtlSeconds / 60,
                })
              },
              beforeDelete: async (user) => {
                const blocker = await accountDeletion.deleteAccount(user.id)

                if (blocker !== null) {
                  throw new APIError("FORBIDDEN", {
                    code: blocker,
                    message: "Something keeps this account from being deleted",
                  })
                }
              },
              afterDelete: async (user) => {
                await accountDeletion.afterDelete(user.id)
                await sendEmail({ kind: "account-deleted", to: user.email, name: user.name })
              },
            },
      additionalFields: {
        settings: { fieldName: "settings", type: "string", input: false },
        nameEffect: { fieldName: "nameEffect", type: "string", required: false, input: false },
        avatarBorder: { fieldName: "avatarBorder", type: "string", required: false, input: false },
      },
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
    session: { storeSessionInDatabase: true, freshAge: config.auth.sessionFreshAgeSeconds },
    advanced: {
      database: { generateId: "uuid" },
      disableOriginCheck: false,
      // Cloudflare sets cf-connecting-ip to the address it received the request from. The
      // default, X-Forwarded-For, keeps whatever the client sent in front of that address.
      ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
      // The api sets the session cookie on its own host, yet the web SSR reads it from the
      // requests it receives and forwards it: when they run on sibling subdomains, the
      // cookie must be scoped to their shared parent domain to reach both.
      crossSubDomainCookies:
        cookieDomain === "" ? { enabled: false } : { enabled: true, domain: cookieDomain },
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        const action = ADMIN_ACTIONS.get(ctx.path)

        if (action !== undefined) {
          // Same session and same target as the admin endpoint itself, and refuse whenever either
          // cannot be resolved: a request the hook cannot read must not skip the target rule.
          const session = await getAuthoritativeSessionFromCtx(ctx)
          const body = adminBodySchema.safeParse(ctx.body)

          if (session === null) {
            throw new APIError("UNAUTHORIZED")
          }

          if (!body.success) {
            throw new APIError("BAD_REQUEST", {
              code: "INVALID_USER_ID",
              message: "Invalid user id",
            })
          }

          const { userId, sessionToken } = body.data
          const revokesOneSession = ctx.path === "/admin/revoke-user-session"
          const targetSession =
            revokesOneSession && sessionToken !== undefined
              ? await ctx.context.internalAdapter.findSession(sessionToken)
              : null
          const targetId = revokesOneSession ? targetSession?.session.userId : userId
          const [actor, target] = await Promise.all([
            db
              .selectFrom("users")
              .select(["id", "role", "banned", "banExpires"])
              .where("id", "=", session.user.id)
              .executeTakeFirst(),
            targetId === undefined
              ? undefined
              : db
                  .selectFrom("users")
                  .select(["id", "role"])
                  .where("id", "=", targetId)
                  .executeTakeFirst(),
          ])
          const can =
            actor === undefined
              ? undefined
              : createPermissions({
                  id: actor.id,
                  role: toRole(actor.role),
                  banned:
                    actor.banned === true &&
                    (actor.banExpires === null || actor.banExpires > new Date()),
                  memberships: [],
                })

          if (can === undefined || target === undefined || !can(action, target)) {
            throw new APIError("FORBIDDEN", {
              code: "FORBIDDEN_TARGET",
              message: "You can't do this for this user",
            })
          }

          return
        }

        // A linked provider is a new way into the account that outlives a password reset: like
        // unlinking, it needs a recent sign-in rather than any session.
        if (ctx.path === "/link-social") {
          const session = await getAuthoritativeSessionFromCtx(ctx)
          const { freshAge } = ctx.context.sessionConfig

          if (session === null) {
            throw new APIError("UNAUTHORIZED")
          }

          if (
            freshAge !== 0 &&
            Date.now() - new Date(session.session.createdAt).getTime() >= freshAge * 1000
          ) {
            throw new APIError("FORBIDDEN", {
              code: "SESSION_NOT_FRESH",
              message: "Session is not fresh",
            })
          }

          return
        }

        if (ctx.path === "/delete-user" && accountDeletion !== undefined) {
          const session = await getAuthoritativeSessionFromCtx(ctx)
          const body = deleteUserBodySchema.safeParse(ctx.body)

          if (session === null) {
            throw new APIError("UNAUTHORIZED")
          }

          // Checked before Better Auth uses up the token, so a blocked user keeps their link.
          const blocker = await accountDeletion.getBlocker(session.user.id)

          if (blocker !== null) {
            throw new APIError("FORBIDDEN", {
              code: blocker,
              message: "Something keeps this account from being deleted",
            })
          }

          if (body.success && body.data.token !== undefined) {
            return
          }

          const credential = await db
            .selectFrom("accounts")
            .select("id")
            .where("userId", "=", session.user.id)
            .where("providerId", "=", "credential")
            .executeTakeFirst()

          // Better Auth only checks a password it is given: an account that has one must give it.
          if (credential !== undefined && (!body.success || (body.data.password ?? "") === "")) {
            throw new APIError("BAD_REQUEST", {
              code: "PASSWORD_REQUIRED",
              message: "Enter your password to delete your account",
            })
          }

          const { freshAge } = ctx.context.sessionConfig

          if (
            credential === undefined &&
            freshAge !== 0 &&
            Date.now() - new Date(session.session.createdAt).getTime() >= freshAge * 1000
          ) {
            throw new APIError("FORBIDDEN", {
              code: "SESSION_NOT_FRESH",
              message: "Session is not fresh",
            })
          }

          return
        }

        if (ctx.path === "/unlink-account") {
          const body = unlinkAccountBodySchema.safeParse(ctx.body)
          const account = body.success
            ? await db
                .selectFrom("accounts")
                .select("providerId")
                .where("id", "=", body.data.accountId)
                .executeTakeFirst()
            : undefined

          // Unlinking the password would let a session alone set a new one (POST
          // /users/me/password) and turn off 2FA, which otherwise both need the password.
          if (account?.providerId === "credential") {
            throw new APIError("BAD_REQUEST", {
              code: "CANNOT_UNLINK_PASSWORD",
              message: "Change or reset your password instead",
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
          before: async (user, ctx) => {
            if (isUnverifiedSocialSignUp(user, ctx?.path)) {
              throw new APIError("FORBIDDEN", {
                code: "SOCIAL_EMAIL_NOT_VERIFIED",
                message: "The provider hasn't verified this email",
              })
            }

            return createBeforeUserCreatedHook({ db })(user)
          },
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

          // Answer as if the link was sent, so the request does not reveal unknown emails.
          if (user === undefined || user.email === null || user.email === "") {
            return
          }

          await sendEmail({ kind: "magic-link", to: user.email, name: user.name, url: data.url })
        },
      }),
      captcha({
        provider: "cloudflare-turnstile",
        secretKey: serverEnv.TURNSTILE_SECRET_KEY,
        endpoints: captchaEndpoints,
      }),
      admin({ defaultRole: "USER", adminRoles: ["ADMIN"], roles: adminPluginRoles }),
      twoFactor({ issuer: "Taiyō", allowPasswordless: true }),
      // The second factor finishes a password sign-in, so it counts as one.
      lastLoginMethod({
        customResolveMethod: (ctx) => (ctx.path.startsWith("/two-factor/verify") ? "email" : null),
      }),
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
              nameEffect: string | null | undefined
              twoFactorEnabled: boolean | null | undefined
              avatarBorder: string | null | undefined
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
