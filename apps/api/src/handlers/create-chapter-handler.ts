import { chapterAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import {
  CHAPTER_STATUSES,
  type ChapterStatus,
  CONTENT_RATINGS,
  FLAGS,
  type NewChapter,
} from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { externalUrlSchema, isFuture, publishAtSchema, toPublishAt } from "../utils/chapter-release"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, languageSchema } from "../utils/schemas"

const createChapterSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .max(config.input.maxChapterTitleLength)
      .nullable()
      .optional()
      .meta({ description: "The title of the chapter, if any.", example: "The Beginning" }),
    number: z
      .number()
      .nonnegative()
      .meta({ description: "The number of the chapter.", example: 112 }),
    volume: z
      .string()
      .min(1)
      .max(config.input.maxVolumeLength)
      .nullable()
      .optional()
      .meta({ description: "The volume of the chapter, if any.", example: "12" }),
    language: languageSchema("The language of the chapter."),
    contentRating: z
      .enum(CONTENT_RATINGS)
      .optional()
      .meta({ description: "The content rating of the chapter.", example: "NORMAL" }),
    flag: z.enum(FLAGS).optional().meta({
      description:
        "The moderation flag of the chapter. Setting it requires the uploader, moderator or admin role.",
      example: "OK",
    }),
    groupIds: z
      .array(z.uuid())
      .max(config.input.maxChapterGroups)
      .default([])
      .meta({
        description: "The IDs of the groups credited on the chapter.",
        example: ["9b2f4c1e-3d5a-4e7b-8c9d-0a1b2c3d4e5f"],
      }),
    publishAt: publishAtSchema,
    externalUrl: externalUrlSchema,
    isExternal: z.boolean().default(false).meta({
      description:
        "Whether the chapter is only hosted on the group's site. It then has no pages on Taiyō and needs `externalUrl`.",
    }),
  })
  .refine((data) => !data.isExternal || typeof data.externalUrl === "string", {
    message: "An external chapter needs an externalUrl.",
    path: ["externalUrl"],
  })

export const createChapterHandler = new Hono().post(
  "/:id/chapters",
  describeRoute({
    summary: "Create a chapter",
    description: `Creates a chapter of a media crediting the given groups: its pages are uploaded afterwards, unless it is external (\`isExternal\`) and only links to \`externalUrl\`. If you are uploader or admin, or credit a group where you have the \`UPLOAD_CHAPTERS\` permission, it is published once its pages are processed (right away when external), or scheduled when \`publishAt\` is in the future. Otherwise it waits for review, hidden from everyone but you and the reviewers, and you can have at most ${config.input.maxPendingChapters} chapters waiting.\n\n**Authentication:** signed-in user.`,
    tags: ["Chapters"],
    responses: {
      201: {
        description: "Chapter created.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the new chapter." }),
                  status: z.enum(CHAPTER_STATUSES).meta({
                    description:
                      "The status of the chapter: `UPLOADING` until its pages are processed, `PUBLISHED` or `SCHEDULED` for an external chapter, or `PENDING` when it waits for review.",
                    example: "UPLOADING",
                  }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You do not have permission to perform this action, or you set `flag` without the uploader, moderator or admin role.",
        404: "No media with the given ID exists, or one of the groups does not exist.",
        451: "The media is locked, so no chapter can be uploaded.",
        409: "You already have too many chapters waiting for review.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(chapterAudit.CREATE, (c) => ({ mediaId: c.req.param("id") })),
  withAuth(),
  validateJson(createChapterSchema),
  checkMedia({ refuseLocked: true }),
  withTransaction,
  async (c) => {
    const { can, db, log, media, user } = c.var
    const body = c.var.json
    const groupIds = [...new Set(body.groupIds)]
    const id = crypto.randomUUID()
    const publishes =
      can("chapter.publish") ||
      groupIds.some((groupId) => can("group.uploadChapters", { id: groupId }))

    if (!publishes && !can("chapter.submit")) {
      return c.fail("FORBIDDEN")
    }

    if (body.flag !== undefined && !can("chapter.flag")) {
      return c.fail("FORBIDDEN")
    }

    const groups =
      groupIds.length === 0
        ? []
        : await db
            .selectFrom("groups")
            .select("id")
            .where("id", "in", groupIds)
            .where("deletedAt", "is", null)
            .execute()

    if (groups.length !== groupIds.length) {
      return c.fail("GROUP_NOT_FOUND")
    }

    if (!publishes) {
      await db.selectFrom("users").select("id").where("id", "=", user.id).forUpdate().execute()

      const pending = await db
        .selectFrom("chapters")
        .select(db.fn.countAll<string>().as("count"))
        .where("uploaderId", "=", user.id)
        .where("status", "=", "PENDING")
        .where("deletedAt", "is", null)
        .executeTakeFirstOrThrow()

      if (Number(pending.count) >= config.input.maxPendingChapters) {
        return c.fail("CHAPTER_SUBMISSION_LIMIT")
      }
    }

    log.set({ chapter: { id } })

    let status: ChapterStatus = "PENDING"

    if (publishes && !body.isExternal) {
      status = "UPLOADING"
    } else if (publishes) {
      status = isFuture(body.publishAt) ? "SCHEDULED" : "PUBLISHED"
    }

    const values: NewChapter = {
      id,
      mediaId: media.id,
      uploaderId: user.id,
      title: body.title ?? null,
      number: body.number,
      volume: body.volume ?? null,
      language: body.language,
      status,
      externalUrl: body.externalUrl ?? null,
      isExternal: body.isExternal,
    }

    if (body.contentRating !== undefined) {
      values.contentRating = body.contentRating
    }

    if (body.flag !== undefined) {
      values.flag = body.flag
    }

    await db
      .insertInto("chapters")
      .values({
        ...values,
        publishAt: toPublishAt(isFuture(body.publishAt) ? (body.publishAt ?? null) : null),
      })
      .execute()

    if (groupIds.length > 0) {
      await db
        .insertInto("chapterGroups")
        .values(groupIds.map((groupId) => ({ chapterId: id, groupId })))
        .execute()
    }

    c.var.audit.set({ target: { id, number: body.number, language: body.language } })

    return c.ok({ id, status: values.status ?? "PUBLISHED" })
  },
)
