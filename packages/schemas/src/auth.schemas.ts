import { z } from "zod"
import { LanguagesSchema, RolesSchema } from "./prisma"

export const sessionSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    image: z.string().url(),
    role: z.object({
      name: RolesSchema,
      permissions: z.string().array(),
    }),
    preferredTitles: LanguagesSchema.nullable(),
  }),
  expires: z.coerce.date(),
})
