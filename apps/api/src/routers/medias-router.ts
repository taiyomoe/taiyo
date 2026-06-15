import { Hono } from "hono"
import { createBannersHandler } from "../handlers/create-banners-handler"
import { createChapterHandler } from "../handlers/create-chapter-handler"
import { createCoversHandler } from "../handlers/create-covers-handler"
import { createMediaHandler } from "../handlers/create-media-handler"
import { deleteMediaHandler } from "../handlers/delete-media-handler"
import { flagMediaHandler } from "../handlers/flag-media-handler"
import { getMediaHandler } from "../handlers/get-media-handler"
import { listBannersHandler } from "../handlers/list-banners-handler"
import { listChaptersHandler } from "../handlers/list-chapters-handler"
import { listCoversHandler } from "../handlers/list-covers-handler"
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
  .route("/", listCoversHandler)
  .route("/", createCoversHandler)
  .route("/", listBannersHandler)
  .route("/", createBannersHandler)
  .route("/", listChaptersHandler)
  .route("/", createChapterHandler)
