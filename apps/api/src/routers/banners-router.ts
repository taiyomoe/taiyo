import { Hono } from "hono"
import { deleteBannerHandler } from "../handlers/delete-banner-handler"
import { getBannerHandler } from "../handlers/get-banner-handler"
import { listManagedBannersHandler } from "../handlers/list-managed-banners-handler"
import { updateBannerHandler } from "../handlers/update-banner-handler"

export const bannersRouter = new Hono()
  .route("/", listManagedBannersHandler)
  .route("/", getBannerHandler)
  .route("/", updateBannerHandler)
  .route("/", deleteBannerHandler)
