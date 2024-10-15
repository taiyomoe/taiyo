import { cacheClient } from "@taiyomoe/cache"
import { db } from "@taiyomoe/db"
import { logsClient } from "@taiyomoe/logs"
import { meilisearchClient } from "@taiyomoe/meilisearch"
import { rabbitPublisher } from "@taiyomoe/rabbit"
import { createMiddleware } from "hono/factory"
import { createTranslator } from "use-intl"
import { MediasService } from "~/services/medias.io-service"
import type { HelpersMiddleware } from "~/types"
import { messages } from "~/utils/get-messages"
import { services } from "~/utils/get-services"
import { logger } from "~/utils/logger"

export const withHelpers = createMiddleware<HelpersMiddleware>(
  async (c, next) => {
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
    c.set("logger", logger)
    c.set("services", services)
    c.set("rabbit", rabbitPublisher)
    c.set("medias", MediasService)

    await next()
  },
)
