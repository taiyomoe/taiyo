import { COMMENT_DELETIONS, COMMENT_TARGET_TYPES, sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { getCommentImageIds } from "@taiyomoe/schemas/comment-content"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import {
  getCommentTargets,
  labelledCommentTargetSchema,
  liveReplyCountSql,
  THREAD_COLUMNS,
} from "../utils/comments"
import { escapeLike } from "../utils/escape-like"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, userSummarySchema } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).max(100).optional().meta({
    description: "Only list the comments containing this text, ignoring case.",
    example: "spoiler",
  }),
  target: z.enum(COMMENT_TARGET_TYPES).optional().meta({
    description: "Only list the comments on this type of resource.",
    example: "CHAPTER",
  }),
  authorId: z.uuid().optional().meta({
    description: "Only list the comments of this user.",
    example: "8a1f0f5e-6c2b-4f7e-9d3a-2b5c7e9f1a4d",
  }),
  deleted: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .default(false)
    .catch(false)
    .meta({
      description: "List the removed comments (`true`) instead of the live ones (`false`).",
      example: "true",
    }),
})
const managedCommentSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the comment." }),
  content: z.string().meta({
    description: "The rich text of the comment, kept even after it was removed.",
    example: "That last panel was incredible.",
  }),
  imageCount: z.int().meta({ description: "The number of images in the comment.", example: 1 }),
  upvoteCount: z.int().meta({ description: "The number of upvotes on the comment.", example: 12 }),
  replyCount: z.int().meta({
    description: "The number of visible replies to the comment. Always 0 for a reply.",
    example: 4,
  }),
  isReply: z.boolean().meta({ description: "Whether the comment is a reply to another comment." }),
  createdAt: z.iso.datetime().meta({ description: "When the comment was posted." }),
  editedAt: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When the author last edited the comment, if any." }),
  deletedAt: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When the comment was removed, if it was." }),
  deletion: z.enum(COMMENT_DELETIONS).nullable().meta({
    description:
      "Who removed the comment: its author (`AUTHOR`), the owner of the profile it is on (`PAGE_OWNER`) or a moderator (`MODERATOR`), if it was removed.",
    example: "MODERATOR",
  }),
  author: userSummarySchema
    .nullable()
    .meta({ description: "The author of the comment, or `null` once they deleted their account." }),
  target: labelledCommentTargetSchema.meta({ description: "The resource the comment is on." }),
})

export const listManagedCommentsHandler = new Hono().get(
  "/managed",
  describeRoute({
    summary: "List comments for moderation",
    description:
      "Lists the comments on every resource for moderation, newest first, with their author and the resource they are on. Removed comments keep their content.\n\n**Required roles:** moderator, admin.",
    tags: ["Comments"],
    responses: {
      200: {
        description: "The matching comments.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(managedCommentSchema.array(), paginationMetaSchema),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The query parameters failed validation.",
      }),
    },
  }),
  withAuth("comment.delete"),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage, search, target, authorId, deleted } = c.var.query
    const base = db
      .selectFrom("comments as c")
      .innerJoin("commentThreads as t", "t.id", "c.threadId")
      .leftJoin("users as u", "u.id", "c.authorId")
      .where("c.deletedAt", deleted ? "is not" : "is", null)
      .where((eb) =>
        search === undefined ? eb.and([]) : eb("c.content", "ilike", `%${escapeLike(search)}%`),
      )
      .where((eb) =>
        target === undefined ? eb.and([]) : eb(`t.${THREAD_COLUMNS[target]}`, "is not", null),
      )
      .where((eb) => (authorId === undefined ? eb.and([]) : eb("c.authorId", "=", authorId)))
    const [rows, totalRow] = await Promise.all([
      base
        .select([
          "c.id",
          "c.content",
          "c.upvoteCount",
          "c.parentId",
          "c.createdAt",
          "c.editedAt",
          "c.deletedAt",
          "c.deletion",
          liveReplyCountSql("c").as("replyCount"),
          "u.id as authorId",
          "u.username",
          "u.displayUsername",
          "u.image",
          "u.nameEffect",
          "u.avatarBorder",
        ])
        .orderBy("c.createdAt", "desc")
        .orderBy("c.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(sql<string>`count(*)`.as("count")).executeTakeFirstOrThrow(),
    ])
    const targets = await getCommentTargets(
      db,
      rows.map((row) => row.id),
    )

    return c.ok(
      rows.flatMap((row) => {
        const commentTarget = targets.get(row.id)

        if (commentTarget === undefined) {
          return []
        }

        return [
          {
            id: row.id,
            content: row.content,
            imageCount: getCommentImageIds(row.content).length,
            upvoteCount: row.upvoteCount,
            replyCount: Number(row.replyCount),
            isReply: row.parentId !== null,
            createdAt: row.createdAt,
            editedAt: row.editedAt,
            deletedAt: row.deletedAt,
            deletion: row.deletion,
            author:
              row.authorId === null
                ? null
                : {
                    id: row.authorId,
                    username: row.username ?? "",
                    displayUsername: row.displayUsername ?? "",
                    image: row.image,
                    nameEffect: row.nameEffect,
                    avatarBorder: row.avatarBorder,
                  },
            target: commentTarget,
          },
        ]
      }),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
