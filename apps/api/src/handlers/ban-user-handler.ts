import { adminAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { deleteChapterPages } from "../chapter-pages"
import { audited } from "../middlewares/audited-middleware"
import { checkUser } from "../middlewares/check-user-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { auditChanges } from "../utils/audit"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, reviewNoteSchema } from "../utils/schemas"

const BAN_NOTE = "This account was banned."
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
  audited(adminAudit.USER_BAN),
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

    const banned = await db
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
      .returning(["banned", "banReason", "banExpires"])
      .executeTakeFirstOrThrow()

    c.var.audit.set({ reason, changes: auditChanges(targetUser, banned) })

    const reviewedAt = sql<Date>`CURRENT_TIMESTAMP`
    const chapters = await db
      .selectFrom("chapters")
      .select(["id", "mediaId", "pages"])
      .where("uploaderId", "=", targetUser.id)
      .where("status", "in", ["PENDING", "UPLOADING"])
      .where("deletedAt", "is", null)
      .forUpdate()
      .execute()

    if (chapters.length > 0) {
      await db
        .updateTable("chapters")
        .set({
          status: "REJECTED",
          rejectionReason: BAN_NOTE,
          reviewerId: user.id,
          reviewedAt,
          pages: null,
        })
        .where(
          "id",
          "in",
          chapters.map((chapter) => chapter.id),
        )
        .execute()
    }

    await Promise.all([
      db
        .updateTable("mediaSuggestions")
        .set({ status: "REJECTED", reviewerId: user.id, reviewerNote: BAN_NOTE, reviewedAt })
        .where("authorId", "=", targetUser.id)
        .where("status", "=", "PENDING")
        .execute(),
      db
        .updateTable("groupOwnershipRequests")
        .set({ status: "REJECTED", reviewerId: user.id, reviewerNote: BAN_NOTE })
        .where("userId", "=", targetUser.id)
        .where("status", "=", "PENDING")
        .execute(),
      db
        .updateTable("groupCreationRequests")
        .set({ status: "REJECTED", reviewerId: user.id, reviewerNote: BAN_NOTE })
        .where("userId", "=", targetUser.id)
        .where("status", "=", "PENDING")
        .execute(),
      db
        .updateTable("groupInvitations")
        .set({ status: "CANCELLED" })
        .where("inviterId", "=", targetUser.id)
        .where("status", "=", "PENDING")
        .execute(),
      db.deleteFrom("sessions").where("userId", "=", targetUser.id).execute(),
    ])

    c.var.afterCommit(async () => {
      for (const chapter of chapters) {
        await deleteChapterPages({ s3, s3Bucket }, chapter)
      }
    })

    return c.ok({ id: targetUser.id, rejectedChapters: chapters.length })
  },
)
