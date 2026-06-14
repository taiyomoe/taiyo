import { kyselyAdapter } from "@better-auth/kysely-adapter"
import { cacheClient } from "@taiyomoe/cache"
import { config } from "@taiyomoe/config"
import type { DB, Kysely, Role, UserSettings } from "@taiyomoe/db"
import { betterAuth } from "better-auth"
import { emailHarmony } from "better-auth-harmony"
import { admin, captcha, customSession, magicLink, username } from "better-auth/plugins"
import { env } from "./env"
import { afterHook } from "./utils/after-hook"
import { createAfterUserCreatedHook } from "./utils/after-user-created-hook"
import { createBeforeHook } from "./utils/before-hook"
import { beforeUserCreatedHook } from "./utils/before-user-created-hook"
import { createSendMagicLink } from "./utils/send-magic-link"
import { sendResetPassword } from "./utils/send-reset-password"
import { sendVerificationEmail } from "./utils/send-verification-email"

export const createAuth = ({ db }: { db: Kysely<DB> }) =>
  betterAuth({
    appName: "Taiyō",
    database: kyselyAdapter(db, { type: "postgres", usePlural: true }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: config.auth.password.minLength,
      maxPasswordLength: config.auth.password.maxLength,
      requireEmailVerification: true,
      sendResetPassword,
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail,
    },
    account: { accountLinking: { enabled: false } },
    user: {
      additionalFields: { settings: { fieldName: "settings", type: "string" } },
    },
    socialProviders: {
      discord: {
        clientId: env.DISCORD_CLIENT_ID,
        clientSecret: env.DISCORD_CLIENT_SECRET,
      },
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    secondaryStorage: {
      set: cacheClient.users.auth.set,
      get: cacheClient.users.auth.get,
      delete: cacheClient.users.auth.invalidate,
    },
    rateLimit: {
      enabled: true,
      storage: "secondary-storage",
      customRules: {
        "/sign-in/email": { window: 60, max: 3 },
        "/sign-in/username": { window: 60, max: 3 },
        "/sign-in/magic-link": { window: 60, max: 1 },
        "/sign-up": { window: 120, max: 1 },
        "/forget-password": { window: 120, max: 1 },
      },
    },
    session: { storeSessionInDatabase: true },
    advanced: { database: { generateId: "uuid" } },
    hooks: { before: createBeforeHook({ db }), after: afterHook },
    databaseHooks: {
      user: {
        create: {
          before: beforeUserCreatedHook,
          after: createAfterUserCreatedHook({ db }),
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
      magicLink({ disableSignUp: true, sendMagicLink: createSendMagicLink({ db }) }),
      captcha({
        provider: "cloudflare-turnstile",
        secretKey: env.TURNSTILE_SECRET_KEY,
        endpoints: ["/sign-up", "/forget-password"],
      }),
      admin({ defaultRole: "USER" }),
      customSession(async ({ session, user }) => ({
        session,
        user: {
          ...user,
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
      })),
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
