import { z } from "zod"

export type ChapterUploadJobData = { taskId: string }

export type ChapterUploadManifest = {
  chapterId: string
  mediaId: string
  uploadId: string
  pages: Array<{ pageId: string; stagingKey: string }>
}

export const chapterUploadManifestSchema: z.ZodType<ChapterUploadManifest> = z.object({
  chapterId: z.string(),
  mediaId: z.string(),
  uploadId: z.string(),
  pages: z.array(z.object({ pageId: z.string(), stagingKey: z.string() })),
})
