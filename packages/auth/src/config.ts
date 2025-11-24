import { cacheClient } from "@taiyomoe/cache"
import { config } from "@taiyomoe/config"
import { db } from "@taiyomoe/db"
import type { Roles } from "@taiyomoe/db/browser"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import {
  admin,
  captcha,
  customSession,
  magicLink,
  username,
} from "better-auth/plugins"
import { emailHarmony } from "better-auth-harmony"
import { env } from "./env"
import { afterHook } from "./utils/after-hook"
import { afterSessionCreatedHook } from "./utils/after-session-created-hook"
import { afterUserCreatedHook } from "./utils/after-user-created-hook"
import { beforeHook } from "./utils/before-hook"
import { beforeUserCreatedHook } from "./utils/before-user-created-hook"
import { sendMagicLink } from "./utils/send-magic-link"
import { sendResetPassword } from "./utils/send-reset-password"
import { sendVerificationEmail } from "./utils/send-verification-email"

export const auth = betterAuth({
  appName: "Taiyō",
  database: prismaAdapter(db, { provider: "postgresql" }),
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
      minUsernameLength: config.auth.username.minLength,
      maxUsernameLength: config.auth.username.maxLength,
      usernameValidator: (input) => config.auth.username.regex.test(input),
    }),
    emailHarmony(),
    magicLink({ disableSignUp: true, sendMagicLink }),
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
          role: Roles
          settings: PrismaJson.UserSettings
        }),
      },
    })),
  ],
})

export type User = Omit<typeof auth.$Infer.Session.user, "settings"> & {
  role: Roles
  settings: PrismaJson.UserSettings
}

export type Session = Omit<typeof auth.$Infer.Session, "user"> & {
  user: User
}
