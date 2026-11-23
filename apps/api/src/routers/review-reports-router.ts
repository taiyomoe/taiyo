import { Hono } from "hono"
import { closeReviewReportHandler } from "../handlers/close-review-report-handler"
import { closeReviewReportsHandler } from "../handlers/close-review-reports-handler"
import { listReviewReportsHandler } from "../handlers/list-review-reports-handler"

export const reviewReportsRouter = new Hono()
  .route("/", listReviewReportsHandler)
  .route("/", closeReviewReportsHandler)
  .route("/", closeReviewReportHandler)
