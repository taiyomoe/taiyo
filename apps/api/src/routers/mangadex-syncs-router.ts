import { Hono } from "hono"
import { cancelMangaDexSyncHandler } from "../handlers/cancel-mangadex-sync-handler"
import { getMangaDexCoverHandler } from "../handlers/get-mangadex-cover-handler"
import { getMangaDexSyncHandler } from "../handlers/get-mangadex-sync-handler"

export const mangaDexSyncsRouter = new Hono()
  .route("/", getMangaDexSyncHandler)
  .route("/", cancelMangaDexSyncHandler)
  .route("/", getMangaDexCoverHandler)
