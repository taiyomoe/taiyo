import { db } from "@taiyomoe/db"
import {
  ContentRatingSchema,
  HomeLayoutSchema,
  LanguagesSchema,
  RolesSchema,
} from "@taiyomoe/schemas/db"
import { betterAuth, z } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin } from "better-auth/plugins"
import { env } from "./env"

export const auth = betterAuth({
  appName: "Taiyō",
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        validator: {
          input: RolesSchema,
          output: RolesSchema,
        },
      },
      contentRating: {
        type: "string",
        defaultValue: "NSFL",
        validator: {
          input: ContentRatingSchema,
          output: ContentRatingSchema,
        },
      },
      preferredTitles: {
        type: "string",
        validator: {
          input: LanguagesSchema,
          output: LanguagesSchema,
        },
      },
      showFollowing: {
        type: "boolean",
        defaultValue: true,
        validator: {
          input: z.boolean(),
          output: z.boolean(),
        },
      },
      showLibrary: {
        type: "boolean",
        defaultValue: true,
        validator: {
          input: z.boolean(),
          output: z.boolean(),
        },
      },
      homeLayout: {
        type: "string",
        defaultValue: "ROWS",
        validator: {
          input: HomeLayoutSchema,
          output: HomeLayoutSchema,
        },
      },
    },
  },
  socialProviders: {
    discord: {
      clientId: env.BETTER_AUTH_DISCORD_ID,
      clientSecret: env.BETTER_AUTH_DISCORD_SECRET,
    },
  },
  plugins: [admin({
    defaultRole: false
  })],
})
