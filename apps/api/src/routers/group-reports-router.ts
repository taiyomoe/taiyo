import { Hono } from "hono"
import { listGroupReportsHandler } from "../handlers/list-group-reports-handler"
import { reviewGroupReportHandler } from "../handlers/review-group-report-handler"

export const groupReportsRouter = new Hono()
  .route("/", listGroupReportsHandler)
  .route("/", reviewGroupReportHandler)
