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
      rawQueue.add("medias-import", input, { priority: 0 }),
    create: (input: CreateMediaMessageInput) =>
      rawQueue.add("medias-create", input, { priority: 0 }),
  },
  covers: {
    import: (input: ImportCoverMessageInput[]) =>
      rawQueue.addBulk(input.map((i) => ({ name: "covers-import", data: i }))),
    upload: (input: UploadCoverMessageInput) =>
      rawQueue.add("covers-upload", input, { priority: 5 }),
  },
  chapters: {
    import: (input: ImportChapterMessageInput[]) =>
      rawQueue.addBulk(
        input.map((i) => ({ name: "chapters-import", data: i })),
      ),
    upload: (input: UploadChapterMessageInput) =>
      rawQueue.add("chapters-upload", input, { priority: 5 }),
  },
}

export * from "./constants"
