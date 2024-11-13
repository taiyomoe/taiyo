import { db } from "@taiyomoe/db"
import { logger } from "~/utils/logger"

export const handleErrors =
  <TArgs extends unknown[]>(fn: (...args: TArgs) => Promise<unknown>) =>
  async (...args: TArgs) => {
    try {
      await fn(...args)
    } catch (err) {
      logger.error("An error occured while handling a RabbitMQ message", err)

      for (const arg of args) {
        if (
          arg &&
          typeof arg === "object" &&
          "taskId" in arg &&
          typeof arg.taskId === "string"
        ) {
          await db.task.update({
            data: { status: "FAILED" },
            where: { id: arg.taskId },
          })
        }
      }
    }
  }
