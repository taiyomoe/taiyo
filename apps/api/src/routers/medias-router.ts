import { Hono } from "hono"
import { createMediaHandler } from "../handlers/create-media-handler"
import { deleteMediaHandler } from "../handlers/delete-media-handler"
import { flagMediaHandler } from "../handlers/flag-media-handler"
import { getMediaHandler } from "../handlers/get-media-handler"
import { reindexMediaHandler } from "../handlers/reindex-media-handler"
import { restoreMediaHandler } from "../handlers/restore-media-handler"
import { searchMediasHandler } from "../handlers/search-medias-handler"
import { updateMediaHandler } from "../handlers/update-media-handler"

export const mediasRouter = new Hono()
  .route("/", createMediaHandler)
  .route("/", getMediaHandler)
  .route("/", searchMediasHandler)
  .route("/", updateMediaHandler)
  .route("/", deleteMediaHandler)
  .route("/", restoreMediaHandler)
  .route("/", flagMediaHandler)
  .route("/", reindexMediaHandler)
