import { ContentRating, Languages } from "@prisma/client"
import { createZodDto } from "nestjs-zod"
import { z } from "nestjs-zod/z"

const uploadCoverSchema = z.object({
  volume: z.coerce.number().min(0).optional(),
  isMainCover: z.coerce.boolean(),
  contentRating: z.nativeEnum(ContentRating),
  language: z.nativeEnum(Languages),
  mediaId: z.string().uuid(),
})

export class UploadCoverDto extends createZodDto(uploadCoverSchema) {}
