import {
  type ContentRating,
  type HomeLayout,
  type Languages,
  type Roles,
  type User,
  db,
} from "@taiyomoe/db"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin, customSession } from "better-auth/plugins"
import { env } from "./env"
import { signedInHandler } from "./handlers/signed-in.auth-handler"
import { signedOutHandler } from "./handlers/signed-out.auth-handler"
import { signedUpHandler } from "./handlers/signed-up.auth-handler"
import { getSessionFromHeaders } from "./utils/get-session-from-headers"

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
  advanced: { generateId: false },
  databaseHooks: {
    user: { create: { after: signedUpHandler } },
    session: { create: { after: signedInHandler } },
  },
  hooks: {
    before: async (ctx) => {
      if (ctx.path === "/sign-out") {
        const session = await getSessionFromHeaders(ctx)

        if (!session) return

        return signedOutHandler(session.user.id, session.session.ipAddress)
      }
    },
  },
  plugins: [
    admin({ defaultRole: false }),
    customSession(async ({ user, session }) => {
      const settings = await db.userSetting.findUnique({
        select: {
          contentRating: true,
          preferredTitles: true,
          showFollowing: true,
          showLibrary: true,
          homeLayout: true,
        },
        where: { userId: user.id },
      })

      return {
        user: {
          ...(user as unknown as User),
          settings: settings!,
        },
        session,
      }
    }),
  ],
})

export type Session = typeof auth.$Infer.Session & {
  user: {
    role: Roles
    settings: {
      contentRating: ContentRating
      preferredTitles: Languages | null
      showFollowing: boolean
      showLibrary: boolean
      homeLayout: HomeLayout
    }
  }
}
