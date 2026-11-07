import { commentAudit } from "@taiyomoe/audit"
import { COMMENT_DELETIONS, sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkComment } from "../middlewares/check-comment-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { loadCommentImages } from "../utils/comments"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const versionSchema = z.object({
  content: z.string(),
  writtenAt: z.iso.datetime(),
})

export const listCommentRevisionsHandler = new Hono().get(
  "/:id/revisions",
  describeRoute({
    summary: "List a comment's revisions",
    description:
      "Returns a comment's current text, even once removed, and every earlier version, newest first.\n\n**Required roles:** moderator, admin.",
    tags: ["Comments"],
    responses: {
      200: {
        description: "The comment's versions.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  current: versionSchema.extend({
                    deletedAt: z.iso.datetime().nullable(),
                    deletion: z.enum(COMMENT_DELETIONS).nullable(),
                  }),
                  revisions: versionSchema.array(),
                  images: z
                    .object({ id: z.uuid(), url: z.url().nullable() })
                    .array()
                    .meta({ description: "The images the current version shows." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({ 404: "No such comment exists." }),
    },
  }),
  audited(commentAudit.REVISIONS_LIST),
  withAuth("comment.review"),
  checkComment(),
  async (c) => {
    const { db, user, comment } = c.var
    const iso = (column: string) =>
      sql<string | null>`to_char(${sql.ref(column)}, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`
    const [current, revisions, images] = await Promise.all([
      db
        .selectFrom("comments")
        .select([
          "content",
          "deletion",
          sql<string>`to_char(coalesce("editedAt", "createdAt"), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as(
            "writtenAt",
          ),
          iso("deletedAt").as("deletedAt"),
        ])
        .where("id", "=", comment.id)
        .executeTakeFirstOrThrow(),
      db
        .selectFrom("commentRevisions")
        .select([
          "content",
          sql<string>`to_char("createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as("writtenAt"),
        ])
        .where("commentId", "=", comment.id)
        .orderBy("createdAt", "desc")
        .execute(),
      loadCommentImages(db, [comment.id], user.id),
    ])

    return c.ok({
      current,
      revisions,
      images: (images.get(comment.id) ?? []).map((image) => ({ id: image.id, url: image.url })),
    })
  },
)
