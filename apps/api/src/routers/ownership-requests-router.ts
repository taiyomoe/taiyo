import { Hono } from "hono"
import { approveOwnershipRequestHandler } from "../handlers/approve-ownership-request-handler"
import { cancelOwnershipRequestHandler } from "../handlers/cancel-ownership-request-handler"
import { listMyOwnershipRequestsHandler } from "../handlers/list-my-ownership-requests-handler"
import { listOwnershipRequestsHandler } from "../handlers/list-ownership-requests-handler"
import { rejectOwnershipRequestHandler } from "../handlers/reject-ownership-request-handler"

export const ownershipRequestsRouter = new Hono()
  .route("/", listOwnershipRequestsHandler)
  .route("/", listMyOwnershipRequestsHandler)
  .route("/", cancelOwnershipRequestHandler)
  .route("/", approveOwnershipRequestHandler)
  .route("/", rejectOwnershipRequestHandler)
