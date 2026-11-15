import { userAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
import { readerSettingsSchema } from "@taiyomoe/schemas/reader-settings"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const updateMyReaderSettingsHandler = new Hono().put(
  "/me/reader-settings",
  describeRoute({
    summary: "Set my reader settings",
    description:
      "Sets the reader settings saved to your account, replacing the previous ones. Unknown settings are dropped, and missing or invalid ones are saved as their defaults.\n\n**Authentication:** signed-in user.",
    tags: ["Settings"],
    responses: {
      200: {
        description: "Reader settings saved.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  settings: readerSettingsSchema.meta({
                    description: "Your saved reader settings.",
                  }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The request body is not a JSON object.",
      }),
    },
  }),
  audited(userAudit.READER_SETTINGS_UPDATE, (c) => ({ id: c.var.user?.id })),
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
