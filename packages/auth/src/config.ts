import { cacheClient } from "@taiyomoe/cache"
import { type Roles, db } from "@taiyomoe/db"
import type { UserSettings } from "@taiyomoe/types"
import { betterAuth } from "better-auth"
import { emailHarmony } from "better-auth-harmony"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin, captcha, customSession, username } from "better-auth/plugins"
import { env } from "./env"
import { signedInHandler } from "./handlers/signed-in.auth-handler"
import { signedUpHandler } from "./handlers/signed-up.auth-handler"
import { afterHook } from "./utils/after-hook"
import { beforeHook } from "./utils/before-hook"
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
  socialProviders: {
    discord: {
      clientId: env.BETTER_AUTH_DISCORD_ID,
      clientSecret: env.BETTER_AUTH_DISCORD_SECRET,
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
    user: { create: { after: signedUpHandler } },
    session: { create: { after: signedInHandler } },
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
    }),
    emailHarmony(),
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: env.TURNSTILE_SECRET_KEY,
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
