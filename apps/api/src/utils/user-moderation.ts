import { ROLES } from "@taiyomoe/permissions"
import z from "zod"
import { userSummarySchema } from "./schemas"

export const managedUserSchema = userSummarySchema.extend({
  role: z.enum(ROLES).meta({ description: "The role of the user.", example: "MODERATOR" }),
  banned: z.boolean().meta({ description: "Whether the user is banned right now." }),
  banReason: z.string().nullable().meta({
    description: "Why the user was banned, if any.",
    example: "Spam in the comments.",
  }),
  banExpires: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When the ban ends, or null for a permanent ban or no ban." }),
  email: z.string().nullable().meta({
    description: "The email address of the user. Only admins see it.",
    example: "kaito@example.com",
  }),
  points: z.int().meta({ description: "The number of points the user has.", example: 1200 }),
  title: z
    .string()
    .nullable()
    .meta({ description: "The profile title the user has equipped, if any.", example: "bookworm" }),
  createdAt: z.iso.datetime().meta({ description: "When the user signed up." }),
})
