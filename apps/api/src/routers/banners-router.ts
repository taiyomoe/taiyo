import { Hono } from "hono"
import { deleteBannerHandler } from "../handlers/delete-banner-handler"
import { deleteBannersHandler } from "../handlers/delete-banners-handler"
import { getBannerHandler } from "../handlers/get-banner-handler"
import { listManagedBannersHandler } from "../handlers/list-managed-banners-handler"
import { updateBannerHandler } from "../handlers/update-banner-handler"
import { updateBannersHandler } from "../handlers/update-banners-handler"

export const bannersRouter = new Hono()
  .route("/", listManagedBannersHandler)
  .route("/", updateBannersHandler)
  .route("/", deleteBannersHandler)
  .route("/", getBannerHandler)
  .route("/", updateBannerHandler)
  .route("/", deleteBannerHandler)
