import { createBullConnection } from "./connection"
import { processChapterUpload, type ProcessorDeps } from "./processor"
import { publishScheduledChapters, type PublisherDeps } from "./publisher"
import { CHAPTER_UPLOAD_QUEUE, type ChapterUploadProducer, getChapterUploadProducer } from "./queue"
import { reapStaleChapterUploads, type ReaperDeps } from "./reaper"
import {
  type ChapterUploadJobData,
  type ChapterUploadManifest,
  chapterUploadManifestSchema,
} from "./types"

export {
  CHAPTER_UPLOAD_QUEUE,
  chapterUploadManifestSchema,
  createBullConnection,
  getChapterUploadProducer,
  processChapterUpload,
  publishScheduledChapters,
  reapStaleChapterUploads,
}

export type {
  ChapterUploadJobData,
  ChapterUploadManifest,
  ChapterUploadProducer,
  ProcessorDeps,
  PublisherDeps,
  ReaperDeps,
}
