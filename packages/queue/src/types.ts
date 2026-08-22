export type ChapterUploadJobData = { taskId: string }

/** Stored verbatim in Task.payload at session creation; read by the worker. */
export type ChapterUploadManifest = {
  chapterId: string
  mediaId: string
  uploadId: string
  pages: { pageId: string; stagingKey: string }[]
}
