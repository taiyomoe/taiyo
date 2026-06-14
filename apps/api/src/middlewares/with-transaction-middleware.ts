import { DeleteObjectsCommand } from "@taiyomoe/s3"
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
 *   - Side-effects registered via `c.var.afterCommit(cb)` run only after
 *     the transaction commits successfully — used to push search-index
 *     updates, enqueue jobs, etc. without tying that work to a rolled-back
 *     write. Callback failures are logged, never thrown: a successful
 *     write must not be reported as failed because a downstream hiccuped.
 *
 * Routes append to the upload list with `log.set({ uploadedKeys: [key] })`
 * after each successful `PutObject`; evlog merges arrays by concatenation.
 *
 * Rolls back (DB) and cleans up (S3) when:
 *   - the handler throws — the error is re-thrown to the global error handler
 *   - the handler responds with status >= 400 — the response is preserved
 */
export const withTransaction = createMiddleware<{
  Variables: { afterCommit: (cb: () => Promise<void>) => void }
}>(async (c, next) => {
  const previous = c.get("db")
  const afterCommitCallbacks: (() => Promise<void>)[] = []

  c.set("afterCommit", (cb) => afterCommitCallbacks.push(cb))
  c.get("log").set({ uploadedKeys: [] })

  let committed = false

  try {
    await previous.transaction().execute(async (trx) => {
      c.set("db", trx)

      await next()

      if (c.res.status >= 400) {
        throw new RollbackResponseError()
      }
    })

    committed = true
  } catch (err) {
    await cleanupUploadedFiles(c)

    if (!(err instanceof RollbackResponseError)) {
      throw err
    }
  } finally {
    c.set("db", previous)
  }

  if (committed) {
    for (const cb of afterCommitCallbacks) {
      try {
        await cb()
      } catch (cbErr) {
        c.get("log").error(cbErr as Error)
      }
    }
  }
})

const cleanupUploadedFiles = async (c: Context) => {
  const keys = (c.get("log").getContext().uploadedKeys ?? []) as string[]

  if (keys.length === 0) {
    return
  }

  await c
    .get("s3")
    .send(
      new DeleteObjectsCommand({
        Bucket: c.get("s3Bucket"),
        Delete: { Objects: keys.map((Key) => ({ Key })) },
      }),
    )
    .catch((cleanupErr: unknown) => {
      // Swallow — we don't want a cleanup failure to mask the original
      // error. Log it so the orphans can be reaped manually.
      c.get("log").error(cleanupErr as Error)
    })
}
