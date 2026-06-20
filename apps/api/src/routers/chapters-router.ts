import { Hono } from "hono"
import { createChapterUploadSessionHandler } from "../handlers/create-chapter-upload-session-handler"
import { deleteChapterHandler } from "../handlers/delete-chapter-handler"
import { finalizeChapterUploadHandler } from "../handlers/finalize-chapter-upload-handler"
import { getChapterHandler } from "../handlers/get-chapter-handler"
import { getChapterUploadStatusHandler } from "../handlers/get-chapter-upload-status-handler"
import { linkChapterGroupHandler } from "../handlers/link-chapter-group-handler"
import { listChapterGroupsHandler } from "../handlers/list-chapter-groups-handler"
import { openChapterHandler } from "../handlers/open-chapter-handler"
import { unlinkChapterGroupHandler } from "../handlers/unlink-chapter-group-handler"
import { updateChapterHandler } from "../handlers/update-chapter-handler"
import { updateChapterHistoryHandler } from "../handlers/update-chapter-history-handler"

export const chaptersRouter = new Hono()
  .route("/", getChapterHandler)
  .route("/", updateChapterHandler)
  .route("/", deleteChapterHandler)
  .route("/", listChapterGroupsHandler)
  .route("/", linkChapterGroupHandler)
  .route("/", unlinkChapterGroupHandler)
  .route("/", openChapterHandler)
  .route("/", updateChapterHistoryHandler)
  .route("/", createChapterUploadSessionHandler)
  .route("/", finalizeChapterUploadHandler)
  .route("/", getChapterUploadStatusHandler)
