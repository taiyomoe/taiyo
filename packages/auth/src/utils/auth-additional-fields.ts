import {
  ContentRatingSchema,
  HomeLayoutSchema,
  LanguagesSchema,
  RolesSchema,
} from "@taiyomoe/schemas/db"
import type { BetterAuthOptions } from "better-auth"
import { z } from "zod"

export const additionalFields: NonNullable<
  BetterAuthOptions["user"]
>["additionalFields"] = {
  role: {
    type: "string",
    defaultValue: "USER",
    validator: {
      input: RolesSchema.default("USER"),
      output: RolesSchema,
    },
  },
  contentRating: {
    type: "string",
    defaultValue: "NSFL",
    validator: {
      input: ContentRatingSchema.default("NSFL"),
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
      input: z.boolean().default(true),
      output: z.boolean(),
    },
  },
  showLibrary: {
    type: "boolean",
    defaultValue: true,
    validator: {
      input: z.boolean().default(true),
      output: z.boolean(),
    },
  },
  homeLayout: {
    type: "string",
    defaultValue: "ROWS",
    validator: {
      input: HomeLayoutSchema.default("ROWS"),
      output: HomeLayoutSchema,
    },
  },
}
