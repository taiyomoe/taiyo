import type { QueueOptions } from "bullmq"
import { env } from "./env"

export const UPLOADS_QUEUE = "{uploads}"
export const IMPORTS_QUEUE = "{imports}"

export const QUEUE_OPTIONS: QueueOptions = {
  connection: { url: env.DRAGONFLY_URL },
}
