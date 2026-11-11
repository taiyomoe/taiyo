import { type CommentImageReaperDeps, reapOrphanCommentImages } from "./comment-image-reaper"
import { createBullConnection } from "./connection"
import { drainNotificationOutbox, purgeNotifications } from "./notifier"
import { processChapterUpload, type ProcessorDeps } from "./processor"
import { publishScheduledChapters, type PublisherDeps } from "./publisher"
import {
  createWebPushSender,
  getVapidPublicKey,
  isExpiredPushStatus,
  type PushMessage,
  type PushSender,
  sendPendingPushes,
} from "./push"
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
  createWebPushSender,
  drainNotificationOutbox,
  getChapterUploadProducer,
  getVapidPublicKey,
  isExpiredPushStatus,
  processChapterUpload,
  publishScheduledChapters,
  purgeNotifications,
  reapOrphanCommentImages,
  reapStaleChapterUploads,
  sendPendingPushes,
}

export type {
  ChapterUploadJobData,
  ChapterUploadManifest,
  ChapterUploadProducer,
  CommentImageReaperDeps,
  ProcessorDeps,
  PushMessage,
  PushSender,
  PublisherDeps,
  ReaperDeps,
}
