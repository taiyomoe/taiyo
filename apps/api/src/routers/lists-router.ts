import { Hono } from "hono"
import { addListItemHandler } from "../handlers/add-list-item-handler"
import { deleteListHandler } from "../handlers/delete-list-handler"
import { getListHandler } from "../handlers/get-list-handler"
import { removeListItemHandler } from "../handlers/remove-list-item-handler"
import { updateListHandler } from "../handlers/update-list-handler"
import { updateListItemHandler } from "../handlers/update-list-item-handler"

export const listsRouter = new Hono()
  .route("/", getListHandler)
  .route("/", updateListHandler)
  .route("/", deleteListHandler)
  .route("/", addListItemHandler)
  .route("/", removeListItemHandler)
  .route("/", updateListItemHandler)
