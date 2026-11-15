import type { Context } from "hono"
import { drainSearchOutbox } from "@taiyomoe/search"
import { createMiddleware } from "hono/factory"

const toLoggableError = (err: unknown) => (err instanceof Error ? err : String(err))

class RollbackResponseError extends Error {
  constructor() {
    super("rollback-on-failed-response")
  }
}

const runCallbacks = async (c: Context, callbacks: Array<() => Promise<void>>) => {
  for (const cb of callbacks) {
    try {
      await cb()
    } catch (cbErr) {
      c.get("log").error(toLoggableError(cbErr))
    }
  }
}

export const withTransaction = createMiddleware<{
  Variables: {
    afterCommit: (cb: () => Promise<void>) => void
    onRollback: (cb: () => Promise<void>) => void
  }
}>(async (c, next) => {
  const previous = c.get("db")
  const afterCommitCallbacks: Array<() => Promise<void>> = []
  const rollbackCallbacks: Array<() => Promise<void>> = []

  c.set("afterCommit", (cb) => {
    afterCommitCallbacks.push(cb)
  })
  c.set("onRollback", (cb) => {
    rollbackCallbacks.push(cb)
  })

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
    await runCallbacks(c, rollbackCallbacks)

    if (!(err instanceof RollbackResponseError)) {
      throw err
    }
  } finally {
    c.set("db", previous)
  }

  if (committed) {
    await runCallbacks(c, afterCommitCallbacks)

    await drainSearchOutbox({
      db: previous,
      meili: c.get("meili"),
      mediasIndex: c.get("mediasIndex"),
    }).catch((drainErr: unknown) => {
      c.get("log").error(toLoggableError(drainErr))
    })
  }
})
