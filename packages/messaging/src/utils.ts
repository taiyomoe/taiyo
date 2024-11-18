import { type TaskStatus, db } from "@taiyomoe/db"
import type { ImportChapterMessageInput } from "@taiyomoe/types"
import type { Job, Queue } from "bullmq"

export const updateTaskStatus =
  (queue: Queue, status: TaskStatus) =>
  async ({ jobId }: { jobId: string }) => {
    const job: Job = await queue.getJob(jobId)
    const input = job.data as ImportChapterMessageInput

    if (!["covers-import", "chapters-import"].includes(job.name)) {
      return
    }

    void db.task.update({
      data: { status },
      where: { id: input.taskId },
    })
  }
