import { DeleteObjectsCommand } from "@taiyomoe/s3"
import type { Context } from "hono"
import { createMiddleware } from "hono/factory"

class RollbackResponseError extends Error {
  constructor() {
    super("rollback-on-failed-response")
  }
}

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
      c.get("log").error(cleanupErr as Error)
    })
}
