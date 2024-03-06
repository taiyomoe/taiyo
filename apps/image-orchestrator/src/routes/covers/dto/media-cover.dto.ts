import { ContentRating, Languages } from "@prisma/client"
import { createZodDto } from "nestjs-zod"
import { z } from "nestjs-zod/z"

const mediaCoverSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.dateString(),
  updatedAt: z.dateString(),
  deletedAt: z.dateString().nullable(),
  volume: z.number().min(0).nullable(),
  isMainCover: z.boolean(),
  language: z.nativeEnum(Languages),
  contentRating: z.nativeEnum(ContentRating),
  mediaId: z.string().uuid(),
  uploaderId: z.string().uuid(),
  deleterId: z.string().uuid().nullable(),
})

export class MediaCoverDto extends createZodDto(mediaCoverSchema) {}
