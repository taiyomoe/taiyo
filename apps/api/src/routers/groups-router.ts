import { Hono } from "hono"
import { cancelGroupInvitationHandler } from "../handlers/cancel-group-invitation-handler"
import { createGroupHandler } from "../handlers/create-group-handler"
import { createGroupInvitationHandler } from "../handlers/create-group-invitation-handler"
import { createGroupReportHandler } from "../handlers/create-group-report-handler"
import { createOwnershipRequestHandler } from "../handlers/create-ownership-request-handler"
import { deleteGroupHandler } from "../handlers/delete-group-handler"
import { demoteGroupMemberHandler } from "../handlers/demote-group-member-handler"
import { followGroupHandler } from "../handlers/follow-group-handler"
import { getGroupFollowHandler } from "../handlers/get-group-follow-handler"
import { getGroupHandler } from "../handlers/get-group-handler"
import { getGroupStatsHandler } from "../handlers/get-group-stats-handler"
import { leaveGroupHandler } from "../handlers/leave-group-handler"
import { listGroupInvitationsHandler } from "../handlers/list-group-invitations-handler"
import { listGroupMediasHandler } from "../handlers/list-group-medias-handler"
import { listGroupMembersHandler } from "../handlers/list-group-members-handler"
import { listGroupOwnershipRequestsHandler } from "../handlers/list-group-ownership-requests-handler"
import { listGroupsHandler } from "../handlers/list-groups-handler"
import { promoteGroupMemberHandler } from "../handlers/promote-group-member-handler"
import { removeGroupMemberHandler } from "../handlers/remove-group-member-handler"
import { transferGroupOwnershipHandler } from "../handlers/transfer-group-ownership-handler"
import { unfollowGroupHandler } from "../handlers/unfollow-group-handler"
import { updateGroupHandler } from "../handlers/update-group-handler"
import { updateGroupMemberHandler } from "../handlers/update-group-member-handler"

export const groupsRouter = new Hono()
  .route("/", listGroupsHandler)
  .route("/", createGroupHandler)
  .route("/", getGroupHandler)
  .route("/", updateGroupHandler)
  .route("/", deleteGroupHandler)
  .route("/", createOwnershipRequestHandler)
  .route("/", listGroupOwnershipRequestsHandler)
  .route("/", listGroupMembersHandler)
  .route("/", updateGroupMemberHandler)
  .route("/", removeGroupMemberHandler)
  .route("/", promoteGroupMemberHandler)
  .route("/", demoteGroupMemberHandler)
  .route("/", leaveGroupHandler)
  .route("/", transferGroupOwnershipHandler)
  .route("/", createGroupInvitationHandler)
  .route("/", listGroupInvitationsHandler)
  .route("/", cancelGroupInvitationHandler)
  .route("/", getGroupFollowHandler)
  .route("/", followGroupHandler)
  .route("/", unfollowGroupHandler)
  .route("/", createGroupReportHandler)
  .route("/", listGroupMediasHandler)
  .route("/", getGroupStatsHandler)
