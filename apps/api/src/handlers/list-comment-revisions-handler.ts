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
  content: z.string().meta({
    description: "The rich text of the version.",
    example: "That last panel was incredible.",
  }),
  writtenAt: z.iso.datetime().meta({ description: "When the version was written." }),
})

export const listCommentRevisionsHandler = new Hono().get(
  "/:id/revisions",
  describeRoute({
    summary: "List a comment's revisions",
    description:
      "Lists the earlier versions of a comment, newest first, along with its current text, kept even once the comment is removed.\n\n**Required roles:** moderator, admin.",
    tags: ["Comments"],
    responses: {
      200: {
        description: "The versions of the comment.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  current: versionSchema
                    .extend({
                      deletedAt: z.iso
                        .datetime()
                        .nullable()
                        .meta({ description: "When the comment was deleted, if it was." }),
                      deletion: z.enum(COMMENT_DELETIONS).nullable().meta({
                        description:
                          "Who deleted the comment, if anyone: its author (`AUTHOR`), the owner of the profile it is on (`PAGE_OWNER`), or a moderator (`MODERATOR`).",
                        example: "MODERATOR",
                      }),
                    })
                    .meta({ description: "The current version of the comment." }),
                  revisions: versionSchema
                    .array()
                    .meta({ description: "The earlier versions of the comment, newest first." }),
                  images: z
                    .object({
                      id: z.uuid().meta({ description: "The ID of the image." }),
                      url: z.url().nullable().meta({
                        description: "The URL of the image, or `null` once a moderator removed it.",
                      }),
                    })
                    .array()
                    .meta({ description: "The images in the current version." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No comment with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
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
