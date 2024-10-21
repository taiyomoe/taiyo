import type { Session } from "@taiyomoe/auth"
import type { cacheClient } from "@taiyomoe/cache"
import type { db } from "@taiyomoe/db"
import type { logsClient } from "@taiyomoe/logs"
import type { meilisearchClient } from "@taiyomoe/meilisearch"
import type { rabbitPublisher } from "@taiyomoe/rabbit"
import type { Bindings } from "hono/types"
import type { createTranslator } from "use-intl"
import type { MdService } from "~/services/md.io-service"
import type { MediasService } from "~/services/medias.io-service"
import type { ScansService } from "~/services/scans.io-service"
import type { TrackersService } from "~/services/trackers.io-service"
import type { services } from "~/utils/get-services"
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
    services: typeof services
    rabbit: typeof rabbitPublisher
    medias: typeof MediasService
    scans: typeof ScansService
    md: typeof MdService
    trackers: typeof TrackersService
  }
}

export type AuthMiddleware = {
  Bindings: Bindings
  Variables: {
    session: Session["user"]
  }
}

export type CustomContext = HelpersMiddleware & AuthMiddleware
