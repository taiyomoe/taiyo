import {
  DEFAULT_USER_FOLLOWS_PER_PAGE,
  USER_FOLLOWS_PER_PAGE_CHOICES,
} from "@taiyomoe/constants"
import { z } from "zod"
import { optionalEnumSchema, pageSchema, perPageSchema } from "./common.schemas"
import {
  ContentRatingSchema,
  CountriesSchema,
  GendersSchema,
  LanguagesSchema,
} from "./prisma"

export const getFollowsSchema = z.object({
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

export const updateUserSettingsSchema = z
  .object({
    profile: z
      .object({
        birthDate: z.coerce.date().nullable(),
        gender: GendersSchema,
        city: z.string().min(1).nullable(),
        country: CountriesSchema.nullable(),
        about: z.string().min(1).nullable(),
      })
      .partial(),
    contentRating: ContentRatingSchema,
    preferredTitles: optionalEnumSchema(LanguagesSchema),
    showFollowing: z.boolean(),
    showLibrary: z.boolean(),
  })
  .partial()

export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>
