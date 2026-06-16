import { config } from "@taiyomoe/config"
import { CONTENT_RATINGS, FLAGS } from "@taiyomoe/db"
import { syncMedia } from "@taiyomoe/search"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { requireChapterAccess } from "../middlewares/require-chapter-access-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, languageSchema } from "../utils/schemas"

const updateChapterSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .max(config.input.maxChapterTitleLength)
      .nullable()
      .optional()
      .meta({ description: "Title or null to clear." }),
    number: z.number().nonnegative().optional().meta({ description: "Chapter number." }),
    volume: z
      .string()
      .min(1)
      .max(config.input.maxVolumeLength)
      .nullable()
      .optional()
      .meta({ description: "Volume or null to clear." }),
    language: languageSchema("Language of the chapter.").optional(),
    contentRating: z.enum(CONTENT_RATINGS).optional().meta({ description: "Content rating." }),
    flag: z.enum(FLAGS).optional().meta({ description: "Visibility flag." }),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  })

export const updateChapterHandler = new Hono().patch(
  "/:id",
  describeRoute({
    summary: "Update a chapter",
    description:
      "Updates the metadata of a chapter. Omitted fields are kept as-is. Send `null` for `title` or `volume` to clear them.\n\n**Authentication:** uploader intern, uploader, moderator, admin — or any signed-in member of a group linked to the chapter.",
    tags: ["Chapters"],
    requestBody: {
      content: { "application/json": await resolver(updateChapterSchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Chapter updated.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the updated chapter." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No chapter with the given id exists.",
        409: "A chapter with the same media, language and number already exists.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("read", "OwnershipRequest"),
  validateJson(updateChapterSchema),
  checkChapter(),
  requireChapterAccess,
  withTransaction,
  async (c) => {
    const { db, chapter } = c.var
    const body = c.var.json
    const targetLanguage = body.language ?? chapter.language
    const targetNumber = body.number ?? chapter.number

    if (
      (body.language !== undefined && body.language !== chapter.language) ||
      (body.number !== undefined && body.number !== chapter.number)
    ) {
      const duplicate = await db
        .selectFrom("chapters")
        .select("id")
        .where("mediaId", "=", chapter.mediaId)
        .where("language", "=", targetLanguage)
        .where("number", "=", targetNumber)
        .where("id", "!=", chapter.id)
        .where("deletedAt", "is", null)
        .executeTakeFirst()

      if (duplicate) {
        return c.fail("CHAPTER_DUPLICATE", { existingChapterId: duplicate.id })
      }
    }

    const updates: Record<string, unknown> = {}

    for (const key of ["title", "number", "volume", "language", "contentRating", "flag"] as const) {
      if (body[key] !== undefined) {
        updates[key] = body[key]
      }
    }

    await db.updateTable("chapters").set(updates).where("id", "=", chapter.id).execute()

    c.var.afterCommit(() =>
      syncMedia(
        { db: c.var.db, meili: c.var.meili, mediasIndex: c.var.mediasIndex },
        chapter.mediaId,
      ),
    )

    return c.ok({ id: chapter.id })
  },
)
