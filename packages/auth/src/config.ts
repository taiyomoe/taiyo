import { cacheClient } from "@taiyomoe/cache"
import { type Roles, db } from "@taiyomoe/db"
import type { UserSettings } from "@taiyomoe/types"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import {
  admin,
  captcha,
  createAuthMiddleware,
  customSession,
} from "better-auth/plugins"
import { env } from "./env"
import { signedInHandler } from "./handlers/signed-in.auth-handler"
import { signedOutHandler } from "./handlers/signed-out.auth-handler"
import { signedUpHandler } from "./handlers/signed-up.auth-handler"
import { getCustomSession } from "./utils/get-custom-session"
import { getSessionFromHeaders } from "./utils/get-session-from-headers"

export const auth = betterAuth({
  appName: "Taiyō",
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
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
  databaseHooks: {
    user: { create: { after: signedUpHandler } },
    session: { create: { after: signedInHandler } },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-out") {
        const session = await getSessionFromHeaders(ctx)

        if (!session) return

        return signedOutHandler(session.user.id, session.session.ipAddress)
      }
    }),
  },
  plugins: [
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: env.TURNSTILE_SECRET_KEY,
    }),
    admin({ defaultRole: "USER" }),
    customSession(getCustomSession),
  ],
})

export type Session = typeof auth.$Infer.Session & {
  user: {
    role: Roles
    settings: UserSettings
  }
}
