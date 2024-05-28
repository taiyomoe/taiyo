import { PrismaAdapter } from "@auth/prisma-adapter"
import { type Languages, type User, db } from "@taiyomoe/db"
import type { Permission } from "@taiyomoe/types"
import { PermissionUtils } from "@taiyomoe/utils"
import NextAuth, { type DefaultSession } from "next-auth"
import Discord from "next-auth/providers/discord"
import { env } from "../env"

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
  callbacks: {
    session: async ({ session, user: adapterUser }) => {
      const user = adapterUser as User
      const settings = await db.userSetting.findUnique({
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
          preferredTitles: settings?.preferredTitleLanguage ?? null,
        },
      }
    },
  },
  events: {
    createUser: async ({ user }) => {
      if (!user.id) return

      await db.userSetting.create({ data: { userId: user.id } })
      await db.userLibrary.create({ data: { userId: user.id } })
    },
  },
})
