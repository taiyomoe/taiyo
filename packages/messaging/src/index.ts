import type {
  CreateMediaMessageInput,
  ImportChapterMessageInput,
  ImportCoverMessageInput,
  ImportMediaMessageInput,
  UploadChapterMessageInput,
  UploadCoverMessageInput,
} from "@taiyomoe/types"
import { Queue, QueueEvents } from "bullmq"
import { QUEUE_OPTIONS, UPLOADS_QUEUE } from "./constants"

export const rawQueue = new Queue(UPLOADS_QUEUE, QUEUE_OPTIONS)
export const rawQueueEvents = new QueueEvents(UPLOADS_QUEUE, QUEUE_OPTIONS)

export const messagingClient = {
  rawQueue,
  rawQueueEvents,

  medias: {
    import: (input: ImportMediaMessageInput) =>
      rawQueue.add("medias-import", input),
    create: (input: CreateMediaMessageInput) =>
      rawQueue.add("medias-create", input),
  },
  covers: {
    import: (input: ImportCoverMessageInput) =>
      rawQueue.add("covers-import", input),
    upload: (input: UploadCoverMessageInput) =>
      rawQueue.add("covers-upload", input),
  },
  chapters: {
    import: (input: ImportChapterMessageInput) =>
      rawQueue.add("chapters-import", input),
    upload: (input: UploadChapterMessageInput) =>
      rawQueue.add("chapters-upload", input),
  },
}

export * from "./constants"
