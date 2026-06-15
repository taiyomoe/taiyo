import { Hono } from "hono"
import { deleteChapterHandler } from "../handlers/delete-chapter-handler"
import { getChapterHandler } from "../handlers/get-chapter-handler"
import { linkChapterGroupHandler } from "../handlers/link-chapter-group-handler"
import { listChapterGroupsHandler } from "../handlers/list-chapter-groups-handler"
import { unlinkChapterGroupHandler } from "../handlers/unlink-chapter-group-handler"
import { updateChapterHandler } from "../handlers/update-chapter-handler"

export const chaptersRouter = new Hono()
  .route("/", getChapterHandler)
  .route("/", updateChapterHandler)
  .route("/", deleteChapterHandler)
  .route("/", listChapterGroupsHandler)
  .route("/", linkChapterGroupHandler)
  .route("/", unlinkChapterGroupHandler)
