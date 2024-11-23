import { type TaskStatus, db } from "@taiyomoe/db"
import { rawQueue } from "@taiyomoe/messaging"
import type { ImportChapterMessageInput } from "@taiyomoe/types"
import type { Job } from "bullmq"

export const updateTaskStatus =
  (status: TaskStatus) =>
  async ({ jobId }: { jobId: string }) => {
    const job: Job = await rawQueue.getJob(jobId)
    const input = job.data as ImportChapterMessageInput

    if (!["covers-import", "chapters-import"].includes(job.name)) {
      return job
    }

    if (status === "DOWNLOADING") {
      /**
       * Wait for the task to be created in the database.
       * Sometimes, it's so fast that the task is not created yet.
       */
      await new Promise((resolve) => setTimeout(resolve, 400))
    }

    await db.task.update({
      data: { status },
      where: { id: input.taskId },
    })

    return job
  }
