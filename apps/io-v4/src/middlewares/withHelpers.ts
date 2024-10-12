import { cacheClient } from "@taiyomoe/cache"
import { db } from "@taiyomoe/db"
import { logsClient } from "@taiyomoe/logs"
import { meilisearchClient } from "@taiyomoe/meilisearch"
import { createMiddleware } from "hono/factory"
import { createTranslator } from "use-intl"
import type { CustomContext } from "../types"
import { messages } from "../utils/get-messages"
import { services } from "../utils/get-services"

export const withHelpers = createMiddleware<CustomContext>(async (c, next) => {
  const t = createTranslator({
    locale: "en",
    namespace: "api",
    messages: messages.en,
  })

  c.set("t", t)
  c.set("db", db)
  c.set("meilisearch", meilisearchClient)
  c.set("cache", cacheClient)
  c.set("logs", logsClient)
  c.set("services", services)

  await next()
})
