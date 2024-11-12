import { PrismaAdapter } from "@auth/prisma-adapter"
import { type Languages, type User, db } from "@taiyomoe/db"
import type { Permission } from "@taiyomoe/types"
import { PermissionUtils } from "@taiyomoe/utils"
import type { DefaultSession, NextAuthConfig } from "next-auth"
import Discord from "next-auth/providers/discord"
import { env } from "./env"
import { createUserHandler } from "./handlers/create-user.handler"
import { signInHandler } from "./handlers/sign-in.hander"
import { signOutHandler } from "./handlers/sign-out.handler"

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

export const authConfig = {
  debug: process.env.NODE_ENV === "development",
  trustHost: true,
  adapter: PrismaAdapter(db),
  providers: [Discord],
  pages: { signIn: "/auth/sign-in" },
  cookies: {
    sessionToken: {
      options: { domain: `.${new URL(env.AUTH_URL).hostname}` },
    },
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
    createUser: createUserHandler,
    signIn: signInHandler,
    signOut: signOutHandler,
  },
} satisfies NextAuthConfig
