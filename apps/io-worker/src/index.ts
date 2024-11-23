import { db } from "@taiyomoe/db"
import { UPLOADS_QUEUE, rawQueue, rawQueueEvents } from "@taiyomoe/messaging"
import type { ImportChapterMessageInput } from "@taiyomoe/types"
import { type Job, Worker } from "bullmq"
import { env } from "~/env"
import { createMediaHandler } from "~/handlers/create-media.handler"
import { importChapterHandler } from "~/handlers/import-chapter.handler"
import { importCoverHandler } from "~/handlers/import-cover.handler"
import { importMediaHandler } from "~/handlers/import-media.handler"
import { uploadChapterHandler } from "~/handlers/upload-chapter.handler"
import { uploadCoverHandler } from "~/handlers/upload-cover.handler"
import { logger } from "~/utils/logger"
import { updateTaskStatus } from "~/utils/update-task-status"

const worker = new Worker(
  UPLOADS_QUEUE,
  async (job) => {
    logger.debug("Worker received a job", job.name, job.data)

    switch (job.name) {
      case "medias-import":
        return await importMediaHandler(job.data)
      case "medias-create":
        return await createMediaHandler(job.data)
      case "covers-import":
        return await importCoverHandler(job.data)
      case "covers-upload":
        return await uploadCoverHandler(job.data)
      case "chapters-import":
        return await importChapterHandler(job.data)
      case "chapters-upload":
        return await uploadChapterHandler(job.data)
      default:
        logger.error("Received unknown job", job.name)
        throw new Error("Received unknown job")
    }
  },
  {
    connection: { url: env.DRAGONFLY_URL },
    limiter: {
      max: 20,
      duration: 1000 * 60,
    },
  },
)

worker.on("ready", () => {
  console.log("io-worker up and running!")
})

rawQueueEvents.on("added", async ({ jobId }) => {
  const job: Job = await rawQueue.getJob(jobId)
  const input = job.data as ImportChapterMessageInput

  if (!["covers-import", "chapters-import"].includes(job.name)) {
    return
  }

  await db.task.create({
    data: {
      id: input.taskId,
      type: job.name === "covers-import" ? "IMPORT_COVER" : "IMPORT_CHAPTER",
      status: "PENDING",
      payload: input,
      sessionId: input.sessionId,
    },
  })
})

rawQueueEvents.on("active", updateTaskStatus("DOWNLOADING"))
rawQueueEvents.on("completed", updateTaskStatus("FINISHED"))
rawQueueEvents.on("failed", async ({ jobId, failedReason }) => {
  const job = await updateTaskStatus("FAILED")({ jobId })

  logger.error(
    "An error occured while handling a job",
    job.name,
    job.data,
    failedReason,
  )
})

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down...")

  await worker.close()

  console.log("All jobs completed, exiting...")
})
