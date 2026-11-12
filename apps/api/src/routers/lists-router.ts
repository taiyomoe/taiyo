import { Hono } from "hono"
import { addListItemHandler } from "../handlers/add-list-item-handler"
import { deleteListHandler } from "../handlers/delete-list-handler"
import { getListHandler } from "../handlers/get-list-handler"
import { listTopListsHandler } from "../handlers/list-top-lists-handler"
import { removeListItemHandler } from "../handlers/remove-list-item-handler"
import { updateListHandler } from "../handlers/update-list-handler"
import { updateListItemHandler } from "../handlers/update-list-item-handler"
import { voteListHandler } from "../handlers/vote-list-handler"

export const listsRouter = new Hono()
  .route("/", listTopListsHandler)
  .route("/", getListHandler)
  .route("/", updateListHandler)
  .route("/", deleteListHandler)
  .route("/", addListItemHandler)
  .route("/", removeListItemHandler)
  .route("/", updateListItemHandler)
  .route("/", voteListHandler)
