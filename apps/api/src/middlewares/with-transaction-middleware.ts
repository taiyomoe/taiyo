import { DeleteObjectsCommand, s3Bucket } from "@taiyomoe/s3"
import type { Context } from "hono"
import { createMiddleware } from "hono/factory"

class RollbackResponseError extends Error {
  constructor() {
    super("rollback-on-failed-response")
  }
}

/**
 * Runs the downstream handler atomically:
 *
 *   - DB writes go through a Kysely transaction (`c.get("db")` is the trx)
 *   - S3 uploads tracked on `log.uploadedKeys` are deleted on failure
 *
 * Routes append to the upload list with `log.set({ uploadedKeys: [key] })`
 * after each successful `PutObject`; evlog merges arrays by concatenation.
 *
 * Rolls back (DB) and cleans up (S3) when:
 *   - the handler throws — the error is re-thrown to the global error handler
 *   - the handler responds with status >= 400 — the response is preserved
 */
export const withTransaction = createMiddleware(async (c, next) => {
  const previous = c.get("db")

  c.get("log").set({ uploadedKeys: [] })

  try {
    await previous.transaction().execute(async (trx) => {
      c.set("db", trx)

      await next()

      if (c.res.status >= 400) {
        throw new RollbackResponseError()
      }
    })
  } catch (err) {
    await cleanupUploadedFiles(c)

    if (!(err instanceof RollbackResponseError)) throw err
  } finally {
    c.set("db", previous)
  }
})

const cleanupUploadedFiles = async (c: Context) => {
  const keys = (c.get("log").getContext().uploadedKeys ?? []) as string[]

  if (keys.length === 0) return

  await c
    .get("s3")
    .send(
      new DeleteObjectsCommand({
        Bucket: s3Bucket,
        Delete: { Objects: keys.map((Key) => ({ Key })) },
      }),
    )
    .catch((cleanupErr: unknown) => {
      // Swallow — we don't want a cleanup failure to mask the original
      // error. Log it so the orphans can be reaped manually.
      c.get("log").error(cleanupErr as Error)
    })
}
