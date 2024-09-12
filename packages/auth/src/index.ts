import { PrismaAdapter } from "@auth/prisma-adapter"
import { type Languages, type User, db } from "@taiyomoe/db"
import { logsClient } from "@taiyomoe/logs"
import { UsersIndexService } from "@taiyomoe/meilisearch/services"
import type { Permission } from "@taiyomoe/types"
import { PermissionUtils } from "@taiyomoe/utils"
import NextAuth, { type DefaultSession } from "next-auth"
import Discord from "next-auth/providers/discord"
import { env } from "../env"
import { getIp } from "./utils"

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://authjs.dev/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: DefaultSession["user"] & {
      id: string
      role: { name: string; permissions: Permission[] }
      preferredTitles: Languages | null
      showFollowing: boolean
      showLibrary: boolean
    }
  }
}

const COOKIE_DOMAIN = `.${env.NEXTAUTH_URL.replace(/https?:\/\//, "")}`

export const { auth, handlers, signIn, signOut } = NextAuth({
  debug: process.env.NODE_ENV === "development",
  trustHost: true,
  adapter: PrismaAdapter(db),
  providers: [
    Discord({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
  ],
  pages: { signIn: "/auth/sign-in" },
  cookies: {
    csrfToken: { options: { domain: COOKIE_DOMAIN } },
    sessionToken: { options: { domain: COOKIE_DOMAIN } },
  },
  callbacks: {
    session: async ({ session, user: adapterUser }) => {
      const user = adapterUser as User
      const settings = await db.userSetting.findUnique({
        select: {
          preferredTitles: true,
          showFollowing: true,
          showLibrary: true,
        },
        where: { userId: user.id },
      })
      const role = {
        name: user.role,
        permissions: PermissionUtils.getRolePermissions(user.role),
      }

      return {
        ...session,
        user: {
          id: user.id,
          image: user.image,
          role,
          ...settings!,
        },
      }
    },
  },
  events: {
    createUser: async ({ user }) => {
      if (!user.id) return

      await db.userProfile.create({ data: { userId: user.id } })
      await db.userSetting.create({ data: { userId: user.id } })
      await db.userLibrary.create({ data: { userId: user.id } })
      await logsClient.users.auth.insert({
        type: "registered",
        ip: getIp(),
        userId: user.id,
      })
      await UsersIndexService.sync(db, [user.id])
    },
    signIn: async ({ user }) => {
      if (!user.id) return

      await logsClient.users.auth.insert({
        type: "signedIn",
        ip: getIp(),
        userId: user.id,
      })
    },
    signOut: async (message) => {
      if ("token" in message) {
        throw new Error("Unreachable with JWT strategy.")
      }

      if (!message.session?.userId) return

      await logsClient.users.auth.insert({
        type: "signedOut",
        ip: getIp(),
        userId: message.session.userId,
      })
    },
  },
})

export type { Session } from "next-auth"
