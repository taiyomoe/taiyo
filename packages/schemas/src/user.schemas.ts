import {
  DEFAULT_USER_FOLLOWS_PER_PAGE,
  USER_FOLLOWS_PER_PAGE_CHOICES,
} from "@taiyomoe/constants"
import { z } from "zod"
import { pageSchema, perPageSchema } from "./common.schemas"

export const getFollowersSchema = z.object({
  userId: z.string().uuid(),
  page: pageSchema,
  perPage: perPageSchema(
    DEFAULT_USER_FOLLOWS_PER_PAGE,
    USER_FOLLOWS_PER_PAGE_CHOICES,
  ),
})

export const toggleFollowSchema = z.object({
  followingId: z.string().uuid(),
})
