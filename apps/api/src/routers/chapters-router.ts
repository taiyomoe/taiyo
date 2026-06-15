import { Hono } from "hono"
import { deleteChapterHandler } from "../handlers/delete-chapter-handler"
import { getChapterHandler } from "../handlers/get-chapter-handler"
import { updateChapterHandler } from "../handlers/update-chapter-handler"

export const chaptersRouter = new Hono()
  .route("/", getChapterHandler)
  .route("/", updateChapterHandler)
  .route("/", deleteChapterHandler)
