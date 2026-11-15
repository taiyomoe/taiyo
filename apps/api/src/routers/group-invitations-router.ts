import { Hono } from "hono"
import { acceptGroupInvitationHandler } from "../handlers/accept-group-invitation-handler"
import { declineGroupInvitationHandler } from "../handlers/decline-group-invitation-handler"

export const groupInvitationsRouter = new Hono()
  .route("/", acceptGroupInvitationHandler)
  .route("/", declineGroupInvitationHandler)
