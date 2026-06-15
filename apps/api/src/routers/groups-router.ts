import { Hono } from "hono"
import { createGroupHandler } from "../handlers/create-group-handler"
import { deleteGroupHandler } from "../handlers/delete-group-handler"
import { getGroupHandler } from "../handlers/get-group-handler"
import { listGroupsHandler } from "../handlers/list-groups-handler"
import { updateGroupHandler } from "../handlers/update-group-handler"

export const groupsRouter = new Hono()
  .route("/", listGroupsHandler)
  .route("/", createGroupHandler)
  .route("/", getGroupHandler)
  .route("/", updateGroupHandler)
  .route("/", deleteGroupHandler)
