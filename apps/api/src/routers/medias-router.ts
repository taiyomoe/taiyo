import { Hono } from "hono"
import { createMediaHandler } from "../handlers/create-media-handler"
import { getMediaHandler } from "../handlers/get-media-handler"
import { searchMediasHandler } from "../handlers/search-medias-handler"

export const mediasRouter = new Hono()
  .route("/", createMediaHandler)
  .route("/", getMediaHandler)
  .route("/", searchMediasHandler)
