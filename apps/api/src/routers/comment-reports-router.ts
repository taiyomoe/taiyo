import { Hono } from "hono"
import { closeCommentReportHandler } from "../handlers/close-comment-report-handler"
import { listCommentReportsHandler } from "../handlers/list-comment-reports-handler"

export const commentReportsRouter = new Hono()
  .route("/", listCommentReportsHandler)
  .route("/", closeCommentReportHandler)
