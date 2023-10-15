import Discord from "@auth/core/providers/discord";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";

import { db, eq } from "@taiyo/db";
import { users, userSettings } from "@taiyo/db/schema/users";
import type { RefinedPermission } from "@taiyo/db/types";
import { PermissionUtils } from "@taiyo/utils";

import { env } from "./env.mjs";

export type { Session } from "next-auth";

// Update this whenever adding new providers so that the client can
export const providers = ["discord"] as const;
export type OAuthProviders = (typeof providers)[number];

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's unique ID. */
      id: string;
      /** The user's current role and permissions. */
      role: {
        name: string;
        permissions: RefinedPermission[];
      };
    } & DefaultSession["user"];
  }
}

export const {
  handlers: { GET, POST },
  auth,
  CSRF_experimental,
} = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Discord({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/sign-in",
  },
  events: {
    session: async ({ session }) => {
      if (session.user.role) return;

      const results = await db
        .select({
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

      const firstResult = results.at(0)!;
      const permissions = PermissionUtils.getRolePermissions(firstResult.role);
      const refinedPermissions = PermissionUtils.refinePermissions(permissions);

      session.user.role = {
        name: firstResult.role,
        permissions: refinedPermissions,
      };
    },
    createUser: async (message) => {
      await db.insert(userSettings).values({ userId: message.user.id });
    },
  },
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),

    // @TODO - if you wanna have auth on the edge
    // jwt: ({ token, profile }) => {
    //   if (profile?.id) {
    //     token.id = profile.id;
    //     token.image = profile.picture;
    //   }
    //   return token;
    // },

    // @TODO
    // authorized({ request, auth }) {
    //   return !!auth?.user
    // }
  },
});
