import { PrismaAdapter } from "@auth/prisma-adapter"
import { type Languages, type User, db } from "@taiyomoe/db"
import type { Permission } from "@taiyomoe/types"
import { PermissionUtils } from "@taiyomoe/utils"
import NextAuth, { type AdapterUser, type DefaultSession } from "next-auth"
import Discord from "next-auth/providers/discord"
import { env } from "../env"

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://authjs.dev/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  type AdapterUser = User

  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: DefaultSession["user"] & {
      id: string
      role: { name: string; permissions: Permission[] }
      preferredTitles: Languages | null
    }
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Discord({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
  ],
  pages: { signIn: "/auth/sign-in" },
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ user, token }) => {
      if (!user || !("role" in user)) {
        return token
      }

      const adapterUser = user as AdapterUser
      const userSettings = await db.userSetting.findFirst({
        where: { userId: adapterUser.id },
      })

      token.role = {
        name: adapterUser.role,
        permissions: PermissionUtils.getRolePermissions(adapterUser.role),
      }

      token.preferredTitles = userSettings?.preferredTitleLanguage ?? null

      return token
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
        role: token.role,
        preferredTitles: token.preferredTitles,
      },
    }),
  },
  events: {
    createUser: async ({ user }) => {
      if (!user.id) return

      await db.userSetting.create({ data: { userId: user.id } })
      await db.userLibrary.create({ data: { userId: user.id } })
    },
  },
})
