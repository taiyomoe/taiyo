import type { ErrorHandler } from "hono"
import { logger } from "../utils/logger"

export const errorHandler: ErrorHandler = async (err, c) => {
  const requestId = c.get("requestId")
  const timestamp = new Date().toISOString()
  const payload = {
    error: err.message,
    stack: err.stack,
  }

  logger.error("Uncaught exception", {
    path: c.req.path,
    method: c.req.method,
    requestId,
    timestamp,
    ...payload,
  })

  return c.fail(
    "INTERNAL_SERVER_ERROR",
    process.env.NODE_ENV === "production" ? undefined : payload,
  )
}
