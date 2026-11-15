import { Hono } from "hono"
import { approveGroupCreationRequestHandler } from "../handlers/approve-group-creation-request-handler"
import { cancelGroupCreationRequestHandler } from "../handlers/cancel-group-creation-request-handler"
import { createGroupCreationRequestHandler } from "../handlers/create-group-creation-request-handler"
import { listGroupCreationRequestsHandler } from "../handlers/list-group-creation-requests-handler"
import { rejectGroupCreationRequestHandler } from "../handlers/reject-group-creation-request-handler"

export const groupCreationRequestsRouter = new Hono()
  .route("/", listGroupCreationRequestsHandler)
  .route("/", createGroupCreationRequestHandler)
  .route("/", cancelGroupCreationRequestHandler)
  .route("/", approveGroupCreationRequestHandler)
  .route("/", rejectGroupCreationRequestHandler)
