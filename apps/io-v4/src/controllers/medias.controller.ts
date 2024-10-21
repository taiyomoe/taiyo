import { Hono } from "hono"
import { mediasImportHandler } from "~/handlers/medias-import.handler"
import { mediasSyncHandler } from "~/handlers/medias-sync.handler"

export const mediasController = new Hono()
  .route("/import", mediasImportHandler)
  .route("/sync", mediasSyncHandler)
