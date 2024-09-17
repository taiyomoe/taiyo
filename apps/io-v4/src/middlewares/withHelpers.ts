import { cacheClient } from "@taiyomoe/cache"
import { db } from "@taiyomoe/db"
import { logsClient } from "@taiyomoe/logs"
import { meilisearchClient } from "@taiyomoe/meilisearch"
import messages from "@taiyomoe/messages/en.json"
import type { InferNestedPaths } from "@taiyomoe/types"
import { createMiddleware } from "hono/factory"
import { createTranslator } from "use-intl"
import type { Context } from "../types"

export const t = createTranslator({
  locale: "en",
  namespace: "api",
  messages,
})<InferNestedPaths<(typeof messages)["api"]>>

export const withHelpers = createMiddleware<Context>(async (c, next) => {
  c.set("t", t)
  c.set("db", db)
  c.set("meilisearch", meilisearchClient)
  c.set("cache", cacheClient)
  c.set("logs", logsClient)

  await next()
})
