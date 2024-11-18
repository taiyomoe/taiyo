import type {
  CreateMediaMessageInput,
  ImportMediaMessageInput,
  UploadChapterMessageInput,
  UploadCoverMessageInput,
} from "@taiyomoe/types"
import { Queue, QueueEvents } from "bullmq"
import { QUEUE_OPTIONS, UPLOADS_QUEUE } from "./constants"

const uploadsQueue = new Queue(UPLOADS_QUEUE, QUEUE_OPTIONS)
const uploadsQueueEvents = new QueueEvents(UPLOADS_QUEUE, QUEUE_OPTIONS)

export const messagingClient = {
  queue: uploadsQueueEvents,

  medias: {
    import: (input: ImportMediaMessageInput) =>
      uploadsQueue.add("medias-import", input),
    create: (input: CreateMediaMessageInput) =>
      uploadsQueue.add("medias-create", input),
  },
  covers: {
    upload: (input: UploadCoverMessageInput) =>
      uploadsQueue.add("covers-upload", input),
  },
  chapters: {
    upload: (input: UploadChapterMessageInput) =>
      uploadsQueue.add("chapters-upload", input),
  },
}

export * from "./constants"
