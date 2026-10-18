import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { deleteChapterPages } from "../chapter-pages"
import { checkUser } from "../middlewares/check-user-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, reviewNoteSchema } from "../utils/schemas"
import { closePendingWork } from "../utils/user-moderation"

const banSchema = z.object({
  reason: reviewNoteSchema.meta({ description: "Why the user is banned. They see it." }),
  days: z
    .int()
    .min(1)
    .max(3650)
    .nullable()
    .default(null)
    .meta({ description: "How many days the ban lasts, or null for a permanent ban." }),
})

export const banUserHandler = new Hono().post(
  "/:id/ban",
  describeRoute({
    summary: "Ban a user",
    description:
      "Bans a user, for a number of days or for good, and signs them out everywhere. Their chapters waiting for review, media suggestions and group requests are rejected, and the group invitations they sent are cancelled. Their group memberships stay but grant nothing while the ban lasts.\n\n**Required roles:** admin, or moderator for regular users.",
    tags: ["Users"],
    requestBody: {
      content: { "application/json": await resolver(banSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "User banned.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid(),
                  rejectedChapters: z
                    .int()
                    .meta({ description: "How many pending chapters were rejected." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No user with the given id exists.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth(),
  validateJson(banSchema),
  checkUser({ includeBanned: true }),
  withTransaction,
  async (c) => {
    const { can, db, s3, s3Bucket, targetUser, user } = c.var
    const { reason, days } = c.var.json

    if (!can("user.ban", { id: targetUser.id, role: targetUser.role })) {
      return c.fail("FORBIDDEN")
    }

    await db
      .updateTable("users")
      .set({
        banned: true,
        banReason: reason,
        banExpires:
          days === null
            ? null
            : sql<Date>`(CURRENT_TIMESTAMP at time zone 'UTC') + make_interval(days => ${days})`,
      })
      .where("id", "=", targetUser.id)
      .execute()

    const chapters = await closePendingWork(db, { userId: targetUser.id, reviewerId: user.id })

    c.var.afterCommit(async () => {
      for (const chapter of chapters) {
        await deleteChapterPages({ s3, s3Bucket }, chapter)
      }
    })

    return c.ok({ id: targetUser.id, rejectedChapters: chapters.length })
  },
)
