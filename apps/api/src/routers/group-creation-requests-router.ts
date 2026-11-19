import { Hono } from "hono"
import { approveGroupCreationRequestHandler } from "../handlers/approve-group-creation-request-handler"
import { approveGroupCreationRequestsHandler } from "../handlers/approve-group-creation-requests-handler"
import { cancelGroupCreationRequestHandler } from "../handlers/cancel-group-creation-request-handler"
import { cancelGroupCreationRequestsHandler } from "../handlers/cancel-group-creation-requests-handler"
import { createGroupCreationRequestHandler } from "../handlers/create-group-creation-request-handler"
import { listGroupCreationRequestsHandler } from "../handlers/list-group-creation-requests-handler"
import { rejectGroupCreationRequestHandler } from "../handlers/reject-group-creation-request-handler"
import { rejectGroupCreationRequestsHandler } from "../handlers/reject-group-creation-requests-handler"

export const groupCreationRequestsRouter = new Hono()
  .route("/", listGroupCreationRequestsHandler)
  .route("/", createGroupCreationRequestHandler)
  .route("/", cancelGroupCreationRequestHandler)
  .route("/", approveGroupCreationRequestHandler)
  .route("/", rejectGroupCreationRequestHandler)
  .route("/", cancelGroupCreationRequestsHandler)
  .route("/", approveGroupCreationRequestsHandler)
  .route("/", rejectGroupCreationRequestsHandler)
