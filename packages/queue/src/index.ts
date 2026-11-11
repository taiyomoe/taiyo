import { type CommentImageReaperDeps, reapOrphanCommentImages } from "./comment-image-reaper"
import { createBullConnection } from "./connection"
import { drainNotificationOutbox, purgeNotifications } from "./notifier"
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
  drainNotificationOutbox,
  getChapterUploadProducer,
  processChapterUpload,
  publishScheduledChapters,
  purgeNotifications,
  reapOrphanCommentImages,
  reapStaleChapterUploads,
}

export type {
  ChapterUploadJobData,
  ChapterUploadManifest,
  ChapterUploadProducer,
  CommentImageReaperDeps,
  ProcessorDeps,
  PublisherDeps,
  ReaperDeps,
}
