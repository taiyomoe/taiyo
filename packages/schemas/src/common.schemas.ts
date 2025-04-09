import { config } from "@taiyomoe/config"
import { z } from "zod"

export const chapterNumberSchema = z.coerce.number().min(0)
export const chapterVolumeSchema = z.coerce.number().min(0).nullish()
export const mimeTypeSchema = z.enum(config.files.allowedMimeTypes)
export const extensionSchema = z.enum(config.files.allowedExtensions)
export const fileSchema = z.object({
  name: z.string(),
  size: z.coerce.number().int().positive(),
  mimeType: mimeTypeSchema,
  extension: extensionSchema,
  file: z.instanceof(File).optional(),
})

export const pageSchema = z.coerce
  .number()
  .int()
  .min(1)
  .catch(config.pagination.defaultPage)

export const perPageSchema = z.coerce
  .number()
  .refine((v) => config.pagination.perPageOptions.includes(v))
  .catch(config.pagination.defaultPerPage)
