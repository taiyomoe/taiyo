import { Hono } from "hono"
import { createReviewReportHandler } from "../handlers/create-review-report-handler"
import { removeReviewHandler } from "../handlers/remove-review-handler"
import { voteReviewHandler } from "../handlers/vote-review-handler"

export const reviewsRouter = new Hono()
  .route("/", voteReviewHandler)
  .route("/", createReviewReportHandler)
  .route("/", removeReviewHandler)
