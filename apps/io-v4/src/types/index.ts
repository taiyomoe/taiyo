import type { Session } from "@taiyomoe/auth"
import type { cacheClient } from "@taiyomoe/cache"
import type { db } from "@taiyomoe/db"
import type { logsClient } from "@taiyomoe/logs"
import type { meilisearchClient } from "@taiyomoe/meilisearch"
import type { Bindings } from "hono/types"
import type { createTranslator } from "use-intl"
import type { ContextServices } from "~/utils/get-services"
import type { logger } from "~/utils/logger"

export type HelpersMiddleware = {
  Bindings: Bindings
  Variables: {
    t: ReturnType<typeof createTranslator<"api">>
    db: typeof db
    meilisearch: typeof meilisearchClient
    cache: typeof cacheClient
    logs: typeof logsClient
    logger: typeof logger
    services: ContextServices
  }
}

export type AuthMiddleware = {
  Bindings: Bindings
  Variables: {
    session: Session["user"]
  }
}

export type CustomContext = HelpersMiddleware & AuthMiddleware
