import { Hono } from "hono"
import { countCommentsHandler } from "../handlers/count-comments-handler"
import { createCommentHandler } from "../handlers/create-comment-handler"
import { createCommentReplyHandler } from "../handlers/create-comment-reply-handler"
import { createCommentReportHandler } from "../handlers/create-comment-report-handler"
import { deleteCommentHandler } from "../handlers/delete-comment-handler"
import { getCommentContextHandler } from "../handlers/get-comment-context-handler"
import { listCommentRepliesHandler } from "../handlers/list-comment-replies-handler"
import { listCommentRevisionsHandler } from "../handlers/list-comment-revisions-handler"
import { listCommentsHandler } from "../handlers/list-comments-handler"
import { updateCommentHandler } from "../handlers/update-comment-handler"
import { voteCommentHandler } from "../handlers/vote-comment-handler"

export const commentsRouter = new Hono()
  .route("/", listCommentsHandler)
  .route("/", countCommentsHandler)
  .route("/", createCommentHandler)
  .route("/", listCommentRepliesHandler)
  .route("/", createCommentReplyHandler)
  .route("/", getCommentContextHandler)
  .route("/", updateCommentHandler)
  .route("/", deleteCommentHandler)
  .route("/", voteCommentHandler)
  .route("/", listCommentRevisionsHandler)
  .route("/", createCommentReportHandler)
