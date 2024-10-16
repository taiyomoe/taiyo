import { importMediaSchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { withAuth } from "~/middlewares/auth.middleware"
import { withValidation } from "~/middlewares/validation.middleware"
import type { CustomContext } from "~/types"

export const mediasImportHandler = new Hono<CustomContext>()

mediasImportHandler.get(
  "/",
  withAuth([
    ["medias", "create"],
    ["mediaCovers", "create"],
    ["mediaTitles", "create"],
    ["mediaChapters", "create"],
  ]),
  withValidation("query", importMediaSchema),
  async ({ json, req, var: { md } }) => {
    const body = req.valid("query")
    const mdMedia = await md.getMedia(body.mdId)

    return json(mdMedia)
  },
)
