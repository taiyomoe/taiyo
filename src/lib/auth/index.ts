import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type Roles } from "@prisma/client";
import { type DefaultSession, type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

import { db } from "~/lib/db";
import { env } from "~/lib/env.mjs";
import { type RefinedPermission } from "~/lib/types";
import { PermissionUtils } from "../utils/permissions.utils";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
      /** The user's current role and permissions. */
      role: {
        name: string;
        permissions: RefinedPermission[];
      };
    } & DefaultSession["user"];
  }

  interface User {
    /** The user's current role */
    role: Roles;
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
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: {
          name: user.role,
          permissions: PermissionUtils.getRolePermissions(user.role),
        },
      },
    }),
  },
};
