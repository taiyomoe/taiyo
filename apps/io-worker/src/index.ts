import { UPLOADS_QUEUE } from "@taiyomoe/messaging"
import { Worker } from "bullmq"
import { env } from "~/env"
import { createMediaHandler } from "~/handlers/create-media.handler"
import { uploadChapterHandler } from "~/handlers/upload-chapter.handler"
import { uploadCoverHandler } from "~/handlers/upload-cover.handler"
import { logger } from "~/utils/logger"

const worker = new Worker(
  UPLOADS_QUEUE,
  async (job) => {
    logger.debug("Worker received a job", job.name, job.data)

    switch (job.name) {
      case "medias-create":
        return await createMediaHandler(job.data)
      case "covers-upload":
        return await uploadCoverHandler(job.data)
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
