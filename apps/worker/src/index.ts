import { config } from "@taiyomoe/config"
import { getDb } from "@taiyomoe/db"
import { ensureStagingLifecycle, getS3Bucket, getS3Client } from "@taiyomoe/s3"
import { scheduleChapterMaintenance, startChapterMaintenanceWorker } from "./maintenance"
import { startChapterProcessingWorker } from "./worker"

const deps = { db: getDb(), s3: getS3Client(), s3Bucket: getS3Bucket() }

// Backstop for the reaper. Best-effort: some S3-compatible stores don't
// implement the lifecycle API — log and continue rather than crash the worker.
await ensureStagingLifecycle(deps.s3, deps.s3Bucket, config.images.stagingExpiryDays).catch(
  (err) => {
    // oxlint-disable-next-line no-console
    console.warn("staging lifecycle rule not applied (store may not support it):", err)
  },
)

const chapterWorker = startChapterProcessingWorker(deps)
const maintenanceWorker = startChapterMaintenanceWorker(deps)

chapterWorker.on("ready", () => {
  // oxlint-disable-next-line no-console
  console.debug("chapter-upload worker ready")
})

await scheduleChapterMaintenance().catch((err) => {
  // oxlint-disable-next-line no-console
  console.warn("chapter maintenance schedule not applied (store may not support it):", err)
})

const shutdown = async () => {
  await Promise.all([chapterWorker.close(), maintenanceWorker.close()])
  process.exit(0)
}

process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)
