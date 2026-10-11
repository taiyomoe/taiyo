export type ChapterUploadJobData = { taskId: string }

export type ChapterUploadManifest = {
  chapterId: string
  mediaId: string
  uploadId: string
  pages: { pageId: string; stagingKey: string }[]
}
