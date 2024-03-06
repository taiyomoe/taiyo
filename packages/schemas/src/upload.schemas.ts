import { z } from "zod"
import { UploadSessionTypeSchema } from "./prisma"

export const startUploadSessionSchema = z.object({
  type: UploadSessionTypeSchema,
  mediaId: z.string().uuid(),
})

export const bulkUploadMediaChapters = z.object({
  mediaId: z.string().uuid(),
  concurrent: z.number().default(5),
})

export type BulkUploadMediaChapters = typeof bulkUploadMediaChapters._type
