import { Hono } from "hono"
import { deleteCoverHandler } from "../handlers/delete-cover-handler"
import { deleteCoversHandler } from "../handlers/delete-covers-handler"
import { getCoverHandler } from "../handlers/get-cover-handler"
import { listManagedCoversHandler } from "../handlers/list-managed-covers-handler"
import { setMainCoverHandler } from "../handlers/set-main-cover-handler"
import { updateCoverHandler } from "../handlers/update-cover-handler"
import { updateCoversHandler } from "../handlers/update-covers-handler"

export const coversRouter = new Hono()
  .route("/", listManagedCoversHandler)
  .route("/", updateCoversHandler)
  .route("/", deleteCoversHandler)
  .route("/", getCoverHandler)
  .route("/", updateCoverHandler)
  .route("/", deleteCoverHandler)
  .route("/", setMainCoverHandler)
