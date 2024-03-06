import { ContentRating } from "@prisma/client"
import { createZodDto } from "nestjs-zod"
import { z } from "nestjs-zod/z"

const uploadBannerSchema = z.object({
  contentRating: z.nativeEnum(ContentRating),
  mediaId: z.string().uuid(),
})

export class UploadBannerDto extends createZodDto(uploadBannerSchema) {}
