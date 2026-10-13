import type { Context } from "hono"
import { DeleteObjectsCommand } from "@taiyomoe/s3"
import { drainSearchOutbox } from "@taiyomoe/search"
import { createMiddleware } from "hono/factory"

const toLoggableError = (err: unknown) => (err instanceof Error ? err : String(err))

class RollbackResponseError extends Error {
  constructor() {
    super("rollback-on-failed-response")
  }
}

export const withTransaction = createMiddleware<{
  Variables: { afterCommit: (cb: () => Promise<void>) => void }
}>(async (c, next) => {
  const previous = c.get("db")
  const afterCommitCallbacks: Array<() => Promise<void>> = []

  c.set("afterCommit", (cb) => {
    afterCommitCallbacks.push(cb)
  })
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
        c.get("log").error(toLoggableError(cbErr))
      }
    }

    await drainSearchOutbox({
      db: previous,
      meili: c.get("meili"),
      mediasIndex: c.get("mediasIndex"),
    }).catch((drainErr: unknown) => {
      c.get("log").error(toLoggableError(drainErr))
    })
  }
})

const cleanupUploadedFiles = async (c: Context) => {
  const { uploadedKeys } = c.get("log").getContext()
  const keys = Array.isArray(uploadedKeys)
    ? uploadedKeys.filter((key): key is string => typeof key === "string")
    : []

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
      c.get("log").error(toLoggableError(cleanupErr))
    })
}
