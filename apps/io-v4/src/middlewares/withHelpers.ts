import { cacheClient } from "@taiyomoe/cache"
import { db } from "@taiyomoe/db"
import { logsClient } from "@taiyomoe/logs"
import { meilisearchClient } from "@taiyomoe/meilisearch"
import en from "@taiyomoe/messages/en.json"
import pt from "@taiyomoe/messages/pt.json"
import { createMiddleware } from "hono/factory"
import { createTranslator } from "use-intl"

const messages = {
  en,
  pt,
}

export const withHelpers = createMiddleware(async (c, next) => {
  const locale = "en"
  const t = createTranslator({
    locale,
    namespace: "api",
    messages: messages[locale],
  })

  c.set("t", t)
  c.set("db", db)
  c.set("meilisearch", meilisearchClient)
  c.set("cache", cacheClient)
  c.set("logs", logsClient)

  await next()
})
