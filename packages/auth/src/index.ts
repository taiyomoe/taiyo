import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { Languages, User, db } from "@taiyomoe/db"
import type { Permission } from "@taiyomoe/types"
import { PermissionUtils } from "@taiyomoe/utils"
import type { AdapterUser, DefaultSession, NextAuthOptions } from "next-auth"
import nextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { env } from "../env"

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  type AdapterUser = User

  interface Session extends DefaultSession {
    user: {
      /** The user's ID */
      id: string
      /** The user's current role and permissions. */
      role: {
        name: string
        permissions: Permission[]
      }
      /** The user's preferred titles language. */
      preferredTitles: Languages | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** The user's current role */
    role: {
      name: string
      permissions: Permission[]
    }
    /** The user's preferred titles language. */
    preferredTitles: Languages | null
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  pages: {
    signIn: "/auth/sign-in",
  },
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
      await db.userSetting.create({
        data: {
          userId: user.id,
        },
      })

      await db.userLibrary.create({
        data: {
          userId: user.id,
        },
      })
    },
  },
}

export const handler = nextAuth(authOptions)
