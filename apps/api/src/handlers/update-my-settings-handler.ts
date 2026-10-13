import { CONTENT_RATINGS, LATEST_UPDATES_LAYOUTS, sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const bodySchema = z.object({
  contentRating: z
    .enum(CONTENT_RATINGS)
    .array()
    .min(1)
    .transform((ratings) => CONTENT_RATINGS.filter((rating) => ratings.includes(rating)))
    .optional()
    .meta({
      description: "The content ratings to show. At least one is required.",
      example: ["NORMAL", "SUGGESTIVE"],
    }),
  latestUpdatesLayout: z
    .enum(LATEST_UPDATES_LAYOUTS)
    .optional()
    .meta({ description: "How the latest updates are laid out.", example: "LIST" }),
})
const settingsSchema = z.object({
  contentRating: z.enum(CONTENT_RATINGS).array().optional(),
  preferredTitles: z.string().optional(),
  showFollowing: z.boolean().optional(),
  showLibrary: z.boolean().optional(),
  homeLayout: z.enum(["ROWS", "COLUMNS"]).optional(),
  latestUpdatesLayout: z.enum(LATEST_UPDATES_LAYOUTS).optional(),
})

export const updateMySettingsHandler = new Hono().patch(
  "/me/settings",
  describeRoute({
    summary: "Update my settings",
    description:
      "Updates the given settings of the signed-in user and leaves the others unchanged. Returns every stored setting.\n\n**Authentication:** signed-in user.",
    tags: ["Settings"],
    requestBody: {
      content: { "application/json": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Settings updated.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(settingsSchema)) },
        },
      },
      ...getOpenApiResponses({
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("update", "Settings"),
  validateJson(bodySchema),
  async (c) => {
    const { auth, db, user } = c.var
    const { settings } = await db
      .updateTable("users")
      .set({
        settings: sql`${sql.ref("settings")} || ${JSON.stringify(c.var.json)}::jsonb`,
      })
      .where("id", "=", user.id)
      .returning("settings")
      .executeTakeFirstOrThrow()
    const { internalAdapter } = await auth.$context
    const updatedUser = await internalAdapter.findUserById(user.id)

    if (updatedUser) {
      await internalAdapter.refreshUserSessions(updatedUser)
    }

    return c.ok(settings)
  },
)
