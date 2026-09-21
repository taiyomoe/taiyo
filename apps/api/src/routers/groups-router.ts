import { Hono } from "hono"
import { addGroupMemberHandler } from "../handlers/add-group-member-handler"
import { createGroupHandler } from "../handlers/create-group-handler"
import { createOwnershipRequestHandler } from "../handlers/create-ownership-request-handler"
import { deleteGroupHandler } from "../handlers/delete-group-handler"
import { demoteGroupMemberHandler } from "../handlers/demote-group-member-handler"
import { getGroupHandler } from "../handlers/get-group-handler"
import { leaveGroupHandler } from "../handlers/leave-group-handler"
import { listGroupMembersHandler } from "../handlers/list-group-members-handler"
import { listGroupOwnershipRequestsHandler } from "../handlers/list-group-ownership-requests-handler"
import { listGroupsHandler } from "../handlers/list-groups-handler"
import { promoteGroupMemberHandler } from "../handlers/promote-group-member-handler"
import { removeGroupMemberHandler } from "../handlers/remove-group-member-handler"
import { updateGroupHandler } from "../handlers/update-group-handler"

export const groupsRouter = new Hono()
  .route("/", listGroupsHandler)
  .route("/", createGroupHandler)
  .route("/", getGroupHandler)
  .route("/", updateGroupHandler)
  .route("/", deleteGroupHandler)
  .route("/", createOwnershipRequestHandler)
  .route("/", listGroupOwnershipRequestsHandler)
  .route("/", listGroupMembersHandler)
  .route("/", addGroupMemberHandler)
  .route("/", removeGroupMemberHandler)
  .route("/", promoteGroupMemberHandler)
  .route("/", demoteGroupMemberHandler)
  .route("/", leaveGroupHandler)
