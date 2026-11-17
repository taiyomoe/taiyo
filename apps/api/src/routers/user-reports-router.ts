import { Hono } from "hono"
import { listUserReportsHandler } from "../handlers/list-user-reports-handler"
import { reviewUserReportHandler } from "../handlers/review-user-report-handler"
import { reviewUserReportsHandler } from "../handlers/review-user-reports-handler"

export const userReportsRouter = new Hono()
  .route("/", listUserReportsHandler)
  .route("/", reviewUserReportHandler)
  .route("/", reviewUserReportsHandler)
