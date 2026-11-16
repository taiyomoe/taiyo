import { Hono } from "hono"
import { acceptGroupInvitationHandler } from "../handlers/accept-group-invitation-handler"
import { acceptGroupInvitationsHandler } from "../handlers/accept-group-invitations-handler"
import { declineGroupInvitationHandler } from "../handlers/decline-group-invitation-handler"
import { declineGroupInvitationsHandler } from "../handlers/decline-group-invitations-handler"

export const groupInvitationsRouter = new Hono()
  .route("/", acceptGroupInvitationHandler)
  .route("/", declineGroupInvitationHandler)
  .route("/", acceptGroupInvitationsHandler)
  .route("/", declineGroupInvitationsHandler)
