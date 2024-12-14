import { randomUUID } from "crypto"
import { type TaskType, db } from "@taiyomoe/db"

const create = async (
  type: TaskType,
  payload: Record<string, unknown>,
  sessionId?: string,
) =>
  await db.task.create({
    data: {
      type,
      status: "PENDING",
      payload,
      sessionId: sessionId ?? randomUUID(),
    },
  })

export const BaseTasksService = {
  create,
}
