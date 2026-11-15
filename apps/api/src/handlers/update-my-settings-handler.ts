import { userAudit } from "@taiyomoe/audit"
import { CONTENT_RATINGS, LATEST_UPDATES_LAYOUTS, sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { auditChanges } from "../utils/audit"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { refreshUserSessions } from "../utils/refresh-sessions"
import { apiSuccessEnvelope, storedLanguageSchema } from "../utils/schemas"

const bodySchema = z.object({
  contentRating: z
    .enum(CONTENT_RATINGS)
    .array()
    .min(1)
    .transform((ratings) => CONTENT_RATINGS.filter((rating) => ratings.includes(rating)))
    .optional()
    .meta({
      description: "The content ratings to show, at least one.",
      example: ["NORMAL", "SUGGESTIVE"],
    }),
  latestUpdatesLayout: z
    .enum(LATEST_UPDATES_LAYOUTS)
    .optional()
    .meta({ description: "How the latest updates are laid out.", example: "LIST" }),
  showFollowing: z
    .boolean()
    .optional()
    .meta({ description: "Whether others can see who you follow.", example: true }),
  showLibrary: z
    .boolean()
    .optional()
    .meta({ description: "Whether others can see your library and reading stats.", example: true }),
  notifyChapters: z.boolean().optional().meta({
    description:
      "Whether new chapters of the media in your library and of the groups you follow notify you.",
    example: true,
  }),
  notifyReplies: z.boolean().optional().meta({
    description: "Whether replies to your comments notify you.",
    example: true,
  }),
  notifyLikes: z.boolean().optional().meta({
    description: "Whether upvotes on your comments notify you, gathered per comment.",
    example: true,
  }),
  notifyFollows: z.boolean().optional().meta({
    description: "Whether new followers notify you, gathered together.",
    example: true,
  }),
  pushLibraryChapters: z.boolean().optional().meta({
    description: "Whether new chapters of the media in your library are pushed to your devices.",
    example: true,
  }),
  pushGroupChapters: z.boolean().optional().meta({
    description: "Whether new chapters of the groups you follow are pushed to your devices.",
    example: true,
  }),
  pushReplies: z.boolean().optional().meta({
    description: "Whether replies to your comments are pushed to your devices.",
    example: true,
  }),
  pushLikes: z.boolean().optional().meta({
    description: "Whether upvotes on your comments are pushed to your devices.",
    example: true,
  }),
  pushFollows: z.boolean().optional().meta({
    description: "Whether new followers are pushed to your devices.",
    example: true,
  }),
})
const settingsSchema = z.object({
  contentRating: z
    .enum(CONTENT_RATINGS)
    .array()
    .optional()
    .meta({ description: "The content ratings to show.", example: ["NORMAL", "SUGGESTIVE"] }),
  preferredTitles: storedLanguageSchema(
    "The language in which titles are shown when available.",
  ).optional(),
  showFollowing: bodySchema.shape.showFollowing,
  showLibrary: bodySchema.shape.showLibrary,
  homeLayout: z
    .enum(["ROWS", "COLUMNS"])
    .optional()
    .meta({ description: "How the home page is laid out.", example: "ROWS" }),
  latestUpdatesLayout: bodySchema.shape.latestUpdatesLayout,
  notifyChapters: bodySchema.shape.notifyChapters,
  notifyReplies: bodySchema.shape.notifyReplies,
  notifyLikes: bodySchema.shape.notifyLikes,
  notifyFollows: bodySchema.shape.notifyFollows,
  pushLibraryChapters: bodySchema.shape.pushLibraryChapters,
  pushGroupChapters: bodySchema.shape.pushGroupChapters,
  pushReplies: bodySchema.shape.pushReplies,
  pushLikes: bodySchema.shape.pushLikes,
  pushFollows: bodySchema.shape.pushFollows,
})

export const updateMySettingsHandler = new Hono().patch(
  "/me/settings",
  describeRoute({
    summary: "Update my settings",
    description:
      "Updates the given settings and leaves the others unchanged. Returns every setting you have saved: a setting you never saved is omitted and takes its default value.\n\n**Authentication:** signed-in user.",
    tags: ["Settings"],
    responses: {
      200: {
        description: "Settings updated.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(settingsSchema)) },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The request body failed validation.",
      }),
    },
  }),
  audited(userAudit.SETTINGS_UPDATE, (c) => ({ id: c.var.user?.id })),
  withAuth(),
  validateJson(bodySchema),
  async (c) => {
    const { auth, db, user } = c.var

    c.var.audit.set({ changes: auditChanges(user.settings, c.var.json) })

    const { settings } = await db
      .updateTable("users")
      .set({
        settings: sql`${sql.ref("settings")} || ${JSON.stringify(c.var.json)}::jsonb`,
      })
      .where("id", "=", user.id)
      .returning("settings")
      .executeTakeFirstOrThrow()

    await refreshUserSessions(auth, user.id)

    return c.ok(settings)
  },
)
