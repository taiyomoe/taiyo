import { sql } from "@taiyomoe/db"
import { ROLES } from "@taiyomoe/permissions"
import z from "zod"
import { userSummarySchema } from "./schemas"

export const managedUserSchema = userSummarySchema.extend({
  role: z.enum(ROLES),
  banned: z.boolean().meta({ description: "Whether the user is banned right now." }),
  banReason: z.string().nullable(),
  banExpires: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When the ban ends, or null for a permanent ban." }),
  email: z
    .string()
    .nullable()
    .meta({ description: "The user's email address. Only admins see it." }),
  createdAt: z.iso.datetime(),
})

export const isBannedSql = sql<boolean>`coalesce("users"."banned", false) and ("users"."banExpires" is null or "users"."banExpires" > (CURRENT_TIMESTAMP at time zone 'UTC'))`
