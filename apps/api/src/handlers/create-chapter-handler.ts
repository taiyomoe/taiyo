import { config } from "@taiyomoe/config"
import { CHAPTER_STATUSES, CONTENT_RATINGS, FLAGS, type NewChapter } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, languageSchema } from "../utils/schemas"

const createChapterSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(config.input.maxChapterTitleLength)
    .nullable()
    .optional()
    .meta({ description: "Title of the chapter, if any.", example: "The Beginning" }),
  number: z.number().nonnegative().meta({ description: "Chapter number.", example: 1 }),
  volume: z
    .string()
    .min(1)
    .max(config.input.maxVolumeLength)
    .nullable()
    .optional()
    .meta({ description: "Volume of the chapter, if any.", example: "1" }),
  language: languageSchema("Language of the chapter."),
  contentRating: z
    .enum(CONTENT_RATINGS)
    .optional()
    .meta({ description: "Content rating.", example: "NORMAL" }),
  flag: z.enum(FLAGS).optional().meta({ description: "Visibility flag.", example: "OK" }),
  groupIds: z
    .array(z.uuid())
    .max(config.input.maxChapterGroups)
    .default([])
    .meta({ description: "Groups credited on the chapter.", example: [crypto.randomUUID()] }),
})

export const createChapterHandler = new Hono().post(
  "/:id/chapters",
  describeRoute({
    summary: "Create a chapter",
    description: `Creates a chapter under a media and credits the given groups. Pages must be uploaded through a dedicated route later. The chapter goes live right away when the uploader is an uploader or an admin, or when it credits a group where the uploader holds \`UPLOAD_CHAPTERS\`. Otherwise it waits for review, hidden from everyone but its uploader and the reviewers; a user can have at most ${config.input.maxPendingChapters} chapters waiting. Setting \`flag\` requires the uploader, moderator or admin role.\n\n**Authentication:** any signed-in user.`,
    tags: ["Chapters"],
    requestBody: {
      content: { "application/json": await resolver(createChapterSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Chapter created.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the newly created chapter." }),
                  status: z.enum(CHAPTER_STATUSES).meta({
                    description: "PUBLISHED when it went live, PENDING when it waits for review.",
                  }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists, or one of the groups does not exist.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth(),
  validateJson(createChapterSchema),
  checkMedia(),
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

    const values: NewChapter = {
      id,
      mediaId: media.id,
      uploaderId: user.id,
      title: body.title ?? null,
      number: body.number,
      volume: body.volume ?? null,
      language: body.language,
      status: publishes ? "PUBLISHED" : "PENDING",
    }

    if (body.contentRating !== undefined) {
      values.contentRating = body.contentRating
    }

    if (body.flag !== undefined) {
      values.flag = body.flag
    }

    await db.insertInto("chapters").values(values).execute()

    if (groupIds.length > 0) {
      await db
        .insertInto("chapterGroups")
        .values(groupIds.map((groupId) => ({ chapterId: id, groupId })))
        .execute()
    }

    return c.ok({ id, status: values.status ?? "PUBLISHED" })
  },
)
