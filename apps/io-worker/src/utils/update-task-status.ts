import type { TaskStatus } from "@taiyomoe/db"
import { db } from "@taiyomoe/db"
import { rawQueue } from "@taiyomoe/messaging"
import type { ImportChapterMessageInput } from "@taiyomoe/types"
import type { Job } from "bullmq"

export const updateTaskStatus =
  (status: TaskStatus) =>
  async ({ jobId }: { jobId: string }) => {
    const job = (await rawQueue.getJob(jobId)) as Job
    const input = job.data as ImportChapterMessageInput

    await db.task.update({
      data: { status },
      where: { id: input.taskId },
    })

    return job
  }
