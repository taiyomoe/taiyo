import { $Enums } from "@prisma/client"
import { z } from "zod"

export const sessionSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    image: z.string().url(),
    role: z.object({
      name: z.nativeEnum($Enums.Roles),
      permissions: z.string().array(),
    }),
    preferredTitles: z.string().nullable(),
  }),
  expires: z.coerce.date(),
})
