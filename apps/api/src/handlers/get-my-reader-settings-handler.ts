import { readerSettingsSchema } from "@taiyomoe/schemas/reader-settings"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const getMyReaderSettingsHandler = new Hono().get(
  "/me/reader-settings",
  describeRoute({
    summary: "Get my reader settings",
    description:
      "Returns the reader settings saved to your account, so every device reads the same way. Settings that are missing or out of range come back as their defaults.\n\n**Authentication:** signed-in user.",
    tags: ["Settings"],
    responses: {
      200: {
        description: "Your reader settings, or null when you never saved any.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(z.object({ settings: readerSettingsSchema.nullable() })),
            ),
          },
        },
      },
      ...getOpenApiResponses({}),
    },
  }),
  withAuth(),
  async (c) => {
    const { db, user } = c.var
    const { readerSettings } = await db
      .selectFrom("users")
      .select("readerSettings")
      .where("id", "=", user.id)
      .executeTakeFirstOrThrow()

    return c.ok({
      settings: readerSettings === null ? null : readerSettingsSchema.parse(readerSettings),
    })
  },
)
