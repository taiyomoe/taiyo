import {
  ContentRating,
  Flag,
  MediaCountryOfOrigin,
  MediaDemography,
  MediaSource,
  MediaStatus,
  MediaType,
} from "@prisma/client"
import { createZodDto } from "nestjs-zod"
import { z } from "nestjs-zod/z"
import { mediaGenresSchema } from "~/schemas"

const mediaSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.dateString(),
  updatedAt: z.dateString(),
  deletedAt: z.dateString().nullable(),
  startDate: z.dateString().nullable(),
  endDate: z.dateString().nullable(),
  synopsis: z.string().nullable(),
  oneShot: z.boolean(),
  trailer: z.string().nullable(),
  tags: z.object({ key: z.string(), isSpoiler: z.boolean() }).array(),
  contentRating: z.nativeEnum(ContentRating),
  type: z.nativeEnum(MediaType),
  status: z.nativeEnum(MediaStatus),
  source: z.nativeEnum(MediaSource),
  demography: z.nativeEnum(MediaDemography),
  countryOfOrigin: z.nativeEnum(MediaCountryOfOrigin),
  genres: mediaGenresSchema.array(),
  flag: z.nativeEnum(Flag),
  creatorId: z.string().uuid(),
  deleterId: z.string().uuid().nullable(),
})

export class MediaDto extends createZodDto(mediaSchema) {}
