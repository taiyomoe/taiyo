import { ContentRating } from "@prisma/client"
import { createZodDto } from "nestjs-zod"
import { z } from "nestjs-zod/z"

const mediaBannerSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.dateString(),
  updatedAt: z.dateString(),
  deletedAt: z.dateString().nullable(),
  contentRating: z.nativeEnum(ContentRating),
  mediaId: z.string().uuid(),
  uploaderId: z.string().uuid(),
  deleterId: z.string().uuid().nullable(),
})

export class MediaBannerDto extends createZodDto(mediaBannerSchema) {}
