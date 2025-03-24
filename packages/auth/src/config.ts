import { cacheClient } from "@taiyomoe/cache"
import { type Roles, db } from "@taiyomoe/db"
import type { UserSettings } from "@taiyomoe/types"
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEX,
} from "@taiyomoe/utils"
import { betterAuth } from "better-auth"
import { emailHarmony } from "better-auth-harmony"
import { prismaAdapter } from "better-auth/adapters/prisma"
import {
  admin,
  captcha,
  customSession,
  magicLink,
  username,
} from "better-auth/plugins"
import { env } from "./env"
import { afterHook } from "./utils/after-hook"
import { afterSessionCreatedHook } from "./utils/after-session-created-hook"
import { afterUserCreatedHook } from "./utils/after-user-created-hook"
import { beforeHook } from "./utils/before-hook"
import { beforeUserCreatedHook } from "./utils/before-user-created-hook"
import { getCustomSession } from "./utils/get-custom-session"
import { sendMagicLink } from "./utils/send-magic-link"
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
      usernameValidator: (input) => USERNAME_REGEX.test(input),
    }),
    emailHarmony(),
    magicLink({ disableSignUp: true, sendMagicLink }),
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
