import { Hono } from "hono"
import { mediasImportHandler } from "~/handlers/medias-import.handler"

export const mediasController = new Hono().route("/", mediasImportHandler)
