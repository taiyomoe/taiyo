import { Queue } from "bullmq"
import { createBullConnection } from "../connection"

export const DATA_EXPORT_QUEUE = "data-export"

export type DataExportJobData = {
  exportId: string
  /** Where the email sends the user, or null when the API knows no web origin. */
  settingsUrl: string | null
}

export type DataExportProducer = {
  enqueue: (data: DataExportJobData) => Promise<void>
}

let queue: Queue<DataExportJobData> | undefined

export const getDataExportProducer = () =>
  ({
    enqueue: async (data) => {
      if (queue === undefined) {
        queue = new Queue<DataExportJobData>(DATA_EXPORT_QUEUE, {
          connection: createBullConnection(),
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: "exponential", delay: 30_000 },
            removeOnComplete: { age: 3_600, count: 1_000 },
            removeOnFail: { age: 24 * 3_600 },
          },
        })
        queue.on("error", (err) => {
          // oxlint-disable-next-line no-console
          console.error(`${DATA_EXPORT_QUEUE} queue error:`, err.message)
        })
      }

      await queue.add("build", data, { jobId: data.exportId })
    },
  }) satisfies DataExportProducer
