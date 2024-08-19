import { z } from "zod"

export const toggleFollowSchema = z.object({
  followingId: z.string().uuid(),
})
