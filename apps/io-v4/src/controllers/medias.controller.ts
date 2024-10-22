import { Hono } from "hono"
import { mediasSyncHandler } from "~/handlers/medias-sync.handler"

export const mediasController = new Hono().route("/sync", mediasSyncHandler)
