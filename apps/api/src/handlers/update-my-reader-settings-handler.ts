import { sql } from "@taiyomoe/db"
import { readerSettingsSchema } from "@taiyomoe/schemas/reader-settings"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const updateMyReaderSettingsHandler = new Hono().put(
  "/me/reader-settings",
  describeRoute({
    summary: "Save my reader settings",
    description:
      "Replaces the reader settings saved to your account. Unknown settings are dropped, and missing or out-of-range ones are saved as their defaults.\n\n**Authentication:** signed-in user.",
    tags: ["Settings"],
    requestBody: {
      content: { "application/json": await resolver(readerSettingsSchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Reader settings saved.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ settings: readerSettingsSchema }))),
          },
        },
      },
      ...getOpenApiResponses({
        422: "The request body is not an object.",
      }),
    },
  }),
  withAuth(),
  validateJson(readerSettingsSchema),
  async (c) => {
    const { db, user } = c.var
    const settings = c.var.json

    await db
      .updateTable("users")
      .set({ readerSettings: sql`${JSON.stringify(settings)}::jsonb` })
      .where("id", "=", user.id)
      .execute()

    return c.ok({ settings })
  },
)
