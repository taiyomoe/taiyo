import { db } from "@taiyomoe/db"
import type {
  CreateMediaMessageInput,
  ImportChapterMessageInput,
  ImportCoverMessageInput,
  ImportMediaMessageInput,
  UploadChapterMessageInput,
  UploadCoverMessageInput,
} from "@taiyomoe/types"
import { type Job, Queue, QueueEvents } from "bullmq"
import { QUEUE_OPTIONS, UPLOADS_QUEUE } from "./constants"
import { updateTaskStatus } from "./utils"

const queue = new Queue(UPLOADS_QUEUE, QUEUE_OPTIONS)
const queueEvents = new QueueEvents(UPLOADS_QUEUE, QUEUE_OPTIONS)

export * from "./constants"
export const messagingClient = {
  queue: queueEvents,

  medias: {
    import: (input: ImportMediaMessageInput) =>
      queue.add("medias-import", input),
    create: (input: CreateMediaMessageInput) =>
      queue.add("medias-create", input),
  },
  covers: {
    import: (input: ImportCoverMessageInput) =>
      queue.add("covers-import", input),
    upload: (input: UploadCoverMessageInput) =>
      queue.add("covers-upload", input),
  },
  chapters: {
    upload: (input: UploadChapterMessageInput) =>
      queue.add("chapters-upload", input),
  },
}

queue.on("waiting", async (job: Job) => {
  if (!["covers-import", "chapters-import"].includes(job.name)) {
    return
  }

  const input = job.data as ImportChapterMessageInput

  void db.task.create({
    data: {
      id: input.taskId,
      type: job.name === "covers-import" ? "IMPORT_COVER" : "IMPORT_CHAPTER",
      status: "PENDING",
      payload: input,
      sessionId: input.sessionId,
    },
  })
})

queueEvents.on("active", updateTaskStatus(queue, "DOWNLOADING"))
queueEvents.on("completed", updateTaskStatus(queue, "FINISHED"))
queueEvents.on("failed", updateTaskStatus(queue, "FAILED"))
