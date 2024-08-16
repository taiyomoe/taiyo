import { $Enums } from "@prisma/client"
import { z } from "zod"

export const sessionSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    image: z.string().url(),
    role: z.object({
      name: z.nativeEnum($Enums.Roles),
      permissions: z.string().array(),
    }),
    preferredTitles: z.nativeEnum($Enums.Languages).nullable(),
  }),
  expires: z.coerce.date(),
})
