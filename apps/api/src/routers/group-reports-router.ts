import { Hono } from "hono"
import { listGroupReportsHandler } from "../handlers/list-group-reports-handler"
import { reviewGroupReportHandler } from "../handlers/review-group-report-handler"
import { reviewGroupReportsHandler } from "../handlers/review-group-reports-handler"

export const groupReportsRouter = new Hono()
  .route("/", listGroupReportsHandler)
  .route("/", reviewGroupReportHandler)
  .route("/", reviewGroupReportsHandler)
