import { ContentRating, Flag } from "@prisma/client"
import { createZodDto } from "nestjs-zod"
import { z } from "nestjs-zod/z"

const uploadChapterSchema = z.object({
  title: z.string().optional(),
  number: z.coerce.number().min(0),
  volume: z.coerce.number().min(0).optional(),
  contentRating: z.nativeEnum(ContentRating),
  flag: z.nativeEnum(Flag),
  mediaId: z.string().uuid(),
  scanIds: z.preprocess((val, ctx) => {
    if (typeof val !== "string") {
      ctx.addIssue({
        code: "invalid_type",
        message: "Expected string.",
        received: typeof val,
        expected: "string",
      })

      return
    }

    return val.split(",")
  }, z.string().uuid().array()),
})

export class UploadChapterDto extends createZodDto(uploadChapterSchema) {}
