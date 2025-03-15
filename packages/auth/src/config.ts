import { cacheClient } from "@taiyomoe/cache"
import { type Roles, db } from "@taiyomoe/db"
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from "@taiyomoe/new-utils"
import type { UserSettings } from "@taiyomoe/types"
import { betterAuth } from "better-auth"
import { emailHarmony } from "better-auth-harmony"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin, captcha, customSession, username } from "better-auth/plugins"
import { env } from "./env"
import { afterHook } from "./utils/after-hook"
import { afterSessionCreatedHook } from "./utils/after-session-created-hook"
import { afterUserCreatedHook } from "./utils/after-user-created-hook"
import { beforeHook } from "./utils/before-hook"
import { beforeUserCreatedHook } from "./utils/before-user-created-hook"
import { getCustomSession } from "./utils/get-custom-session"
import { sendResetPassword } from "./utils/send-reset-password"
import { sendVerificationEmail } from "./utils/send-verification-email"

export const auth = betterAuth({
  appName: "Taiyō",
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 50,
    requireEmailVerification: true,
    sendResetPassword,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail,
  },
  account: { accountLinking: { enabled: false } },
  socialProviders: {
    discord: {
      clientId: env.BETTER_AUTH_DISCORD_ID,
      clientSecret: env.BETTER_AUTH_DISCORD_SECRET,
    },
    google: {
      clientId: env.BETTER_AUTH_GOOGLE_ID,
      clientSecret: env.BETTER_AUTH_GOOGLE_SECRET,
    },
  },
  secondaryStorage: {
    set: cacheClient.users.auth.set,
    get: cacheClient.users.auth.get,
    delete: cacheClient.users.auth.invalidate,
  },
  session: { storeSessionInDatabase: true },
  advanced: { generateId: false },
  hooks: { before: beforeHook, after: afterHook },
  databaseHooks: {
    user: {
      create: {
        before: beforeUserCreatedHook,
        after: afterUserCreatedHook,
      },
    },
    session: { create: { after: afterSessionCreatedHook } },
  },
  plugins: [
    username({
      minUsernameLength: USERNAME_MIN_LENGTH,
      maxUsernameLength: USERNAME_MAX_LENGTH,
    }),
    emailHarmony(),
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: env.TURNSTILE_SECRET_KEY,
      endpoints: ["/sign-up", "/forget-password"],
    }),
    admin({ defaultRole: "USER" }),
    customSession(getCustomSession),
  ],
})

export type User = typeof auth.$Infer.Session.user & {
  role: Roles
  settings: UserSettings
}

export type Session = typeof auth.$Infer.Session & {
  user: User
}
