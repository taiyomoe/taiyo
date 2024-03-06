import { ContentRating, Flag, Languages } from "@prisma/client"
import { createZodDto } from "nestjs-zod"
import { z } from "nestjs-zod/z"

const mediaChapterSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.dateString(),
  updatedAt: z.dateString(),
  deletedAt: z.dateString().nullable(),
  title: z.string().nullable(),
  number: z.number().min(0),
  volume: z.number().min(0).nullable(),
  pages: z.object({ id: z.string().uuid(), extension: z.enum(["jpg", "gif"]) }).array(),
  language: z.nativeEnum(Languages),
  contentRating: z.nativeEnum(ContentRating),
  flag: z.nativeEnum(Flag),
  mediaId: z.string().uuid(),
  uploaderId: z.string().uuid(),
  deleterId: z.string().uuid().nullable(),
})

export class MediaChapterDto extends createZodDto(mediaChapterSchema) {}
