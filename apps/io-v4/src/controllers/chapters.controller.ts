import { Hono } from "hono"
import { uploadChapterHandler } from "~/handlers/upload-chapter.handler"

export const chaptersController = new Hono().route("/", uploadChapterHandler)
