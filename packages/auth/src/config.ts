import {
  type ContentRating,
  type HomeLayout,
  type Languages,
  type Roles,
  db,
} from "@taiyomoe/db"
import {} from "@taiyomoe/schemas/db"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin } from "better-auth/plugins"
import { env } from "./env"
import { signedInHandler } from "./handlers/signed-in.auth-handler"
import { signedOutHandler } from "./handlers/signed-out.auth-handler"
import { signedUpHandler } from "./handlers/signed-up.auth-handler"
import { additionalFields } from "./utils/auth-additional-fields"

export const auth = betterAuth({
  appName: "Taiyō",
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    discord: {
      clientId: env.BETTER_AUTH_DISCORD_ID,
      clientSecret: env.BETTER_AUTH_DISCORD_SECRET,
    },
  },
  user: { additionalFields },
  advanced: { generateId: false },
  databaseHooks: {
    user: { create: { after: signedUpHandler } },
    session: { create: { after: signedInHandler } },
  },
  hooks: {
    after: async (ctx) => {
      const session = ctx.context.session

      if (!session) return

      if (ctx.path === "/sign-out") {
        return signedOutHandler(session.user.id, session.session.ipAddress)
      }
    },
  },
  plugins: [admin({ defaultRole: false })],
})

export type Session = typeof auth.$Infer.Session & {
  user: {
    role: Roles
    contentRating: ContentRating
    preferredTitles: Languages | undefined
    showFollowing: boolean
    showLibrary: boolean
    homeLayout: HomeLayout
  }
}
