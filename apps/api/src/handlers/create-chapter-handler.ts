import { config } from "@taiyomoe/config"
import { CONTENT_RATINGS, FLAGS, type NewChapter } from "@taiyomoe/db"
import { syncMedia } from "@taiyomoe/search"
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
})

export const createChapterHandler = new Hono().post(
  "/:id/chapters",
  describeRoute({
    summary: "Create a chapter",
    description:
      "Creates a chapter under a media. Pages must be uploaded through a dedicated route later.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
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
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists.",
        409: "A chapter with the same media, language and number already exists.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("create", "Chapter"),
  validateJson(createChapterSchema),
  checkMedia(),
  withTransaction,
  async (c) => {
    const { db, log, media, user } = c.var
    const body = c.var.json
    const duplicate = await db
      .selectFrom("chapters")
      .select("id")
      .where("mediaId", "=", media.id)
      .where("language", "=", body.language)
      .where("number", "=", body.number)
      .where("deletedAt", "is", null)
      .executeTakeFirst()

    if (duplicate) {
      return c.fail("CHAPTER_DUPLICATE", { existingChapterId: duplicate.id })
    }

    const id = crypto.randomUUID()

    log.set({ chapter: { id } })

    const values: NewChapter = {
      id,
      mediaId: media.id,
      uploaderId: user.id,
      title: body.title ?? null,
      number: body.number,
      volume: body.volume ?? null,
      language: body.language,
    }

    if (body.contentRating !== undefined) {
      values.contentRating = body.contentRating
    }

    if (body.flag !== undefined) {
      values.flag = body.flag
    }

    await db.insertInto("chapters").values(values).execute()

    c.var.afterCommit(() => syncMedia({ db: c.var.db, meili: c.var.meili }, media.id))

    return c.ok({ id })
  },
)
