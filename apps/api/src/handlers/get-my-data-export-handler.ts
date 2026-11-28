import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { withAuth } from "../middlewares/with-auth-middleware"
import { dataExportStateSchema, getDataExportState } from "../utils/data-exports"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const getMyDataExportHandler = new Hono().get(
  "/me/data-exports/latest",
  describeRoute({
    summary: "Get my latest data export",
    description:
      "Returns your most recent data export and when you can ask for another one. Download a ready archive with the download route.\n\n**Authentication:** signed-in user.",
    tags: ["Your data"],
    responses: {
      200: {
        description: "Your latest data export.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(dataExportStateSchema)) },
        },
      },
      ...getOpenApiResponses({ 401: true, 403: true }),
    },
  }),
  withAuth(),
  async (c) => c.ok(await getDataExportState(c.var.db, c.var.user.id)),
)
