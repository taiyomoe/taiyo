import { Hono } from "hono"
import { deleteCoverHandler } from "../handlers/delete-cover-handler"
import { getCoverHandler } from "../handlers/get-cover-handler"
import { setMainCoverHandler } from "../handlers/set-main-cover-handler"
import { updateCoverHandler } from "../handlers/update-cover-handler"

export const coversRouter = new Hono()
  .route("/", getCoverHandler)
  .route("/", updateCoverHandler)
  .route("/", deleteCoverHandler)
  .route("/", setMainCoverHandler)
