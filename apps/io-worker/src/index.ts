import { UPLOADS_QUEUE } from "@taiyomoe/messaging"
import { env } from "@taiyomoe/messaging/env"
import { Worker } from "bullmq"
import { uploadChapterHandler } from "~/handlers/upload-chapter.handler"
import { logger } from "~/utils/logger"

const worker = new Worker(
  UPLOADS_QUEUE,
  async (job) => {
    logger.debug("Worker received a job", job.name, job.data)

    switch (job.name) {
      case "chapters-upload":
        return await uploadChapterHandler(job.data)
      default:
        logger.error("Received unknown job", job.name)
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
