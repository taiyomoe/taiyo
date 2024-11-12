import type { Session } from "@taiyomoe/auth/server"
import type { cacheClient } from "@taiyomoe/cache"
import type { db } from "@taiyomoe/db"
import type { logsClient } from "@taiyomoe/logs"
import type { meilisearchClient } from "@taiyomoe/meilisearch"
import type { rabbitPublisher } from "@taiyomoe/rabbit"
import type { Bindings } from "hono/types"
import type { createTranslator } from "use-intl/core"
import type { FilesService } from "~/services/files.io-service"
import type { MdService } from "~/services/md.io-service"
import type { MediasService } from "~/services/medias.io-service"
import type { ScansService } from "~/services/scans.io-service"
import type { TrackersService } from "~/services/trackers.io-service"
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
    rabbit: typeof rabbitPublisher
    medias: typeof MediasService
    scans: typeof ScansService
    md: typeof MdService
    trackers: typeof TrackersService
    files: typeof FilesService
  }
}

export type AuthMiddleware = {
  Bindings: Bindings
  Variables: {
    session: Session["user"]
  }
}

export type CustomContext = HelpersMiddleware & AuthMiddleware
