import type { ErrorHandler } from "hono"

export const errorHandler: ErrorHandler = async (err, c) => {
  c.get("log").error(err)

  return c.fail(
    "INTERNAL_SERVER_ERROR",
    process.env.NODE_ENV === "production"
      ? undefined
      : { error: err.message, stack: err.stack },
  )
}
