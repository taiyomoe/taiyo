import { Hono } from "hono"
import { chaptersUploadHandler } from "../handlers/chapters-upload.handler"

export const chaptersController = new Hono().route("/", chaptersUploadHandler)
