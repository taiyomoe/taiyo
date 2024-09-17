import type { cacheClient } from "@taiyomoe/cache"
import type { db } from "@taiyomoe/db"
import type { logsClient } from "@taiyomoe/logs"
import type { meilisearchClient } from "@taiyomoe/meilisearch"
import type { t } from "../middlewares/withHelpers"

export type Context = {
  Variables: {
    t: typeof t
    db: typeof db
    meilisearch: typeof meilisearchClient
    cache: typeof cacheClient
    logs: typeof logsClient
  }
}
