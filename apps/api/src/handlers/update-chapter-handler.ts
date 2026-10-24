import { config } from "@taiyomoe/config"
import { CONTENT_RATINGS, FLAGS, sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { authorizeChapter } from "../middlewares/authorize-chapter-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { externalUrlSchema, isFuture, publishAtSchema, toPublishAt } from "../utils/chapter-release"
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
    publishAt: publishAtSchema,
    externalUrl: externalUrlSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  })

export const updateChapterHandler = new Hono().patch(
  "/:id",
  describeRoute({
    summary: "Update a chapter",
    description:
      "Updates the metadata of a chapter. Omitted fields are kept as-is. Send `null` for `title` or `volume` to clear them.\n\n`publishAt` reschedules a chapter that is not out yet; `null` or a past time releases a scheduled chapter now. A chapter that is already out cannot be scheduled again. An external chapter always keeps an `externalUrl`.\n\nChanging `flag` requires the uploader, moderator or admin role. The uploader of a scheduled chapter who could not edit it once out may only change `publishAt`.\n\n**Authentication:** uploader, moderator, admin — or a member with `EDIT_CHAPTERS` in a group credited on the chapter.",
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
        409: "The chapter is already out and cannot be scheduled.",
        422: "The request data failed validation, or it removes the link of an external chapter.",
      }),
    },
  }),
  withAuth(),
  validateJson(updateChapterSchema),
  checkChapter({ unpublished: true }),
  authorizeChapter("update"),
  withTransaction,
  async (c) => {
    const { can, db, chapter, chapterTarget } = c.var
    const body = c.var.json
    const releaseOnly =
      chapter.status === "SCHEDULED" &&
      !can("chapter.update", { ...chapterTarget, status: "PUBLISHED" })

    if (body.flag !== undefined && !can("chapter.flag")) {
      return c.fail("FORBIDDEN")
    }

    if (releaseOnly && Object.keys(body).some((key) => key !== "publishAt")) {
      return c.fail("FORBIDDEN")
    }

    const updates: Record<string, unknown> = {}

    for (const key of ["title", "number", "volume", "language", "contentRating", "flag"] as const) {
      if (body[key] !== undefined) {
        updates[key] = body[key]
      }
    }

    if (body.externalUrl === null && chapter.isExternal) {
      return c.fail("CHAPTER_EXTERNAL_LINK_REQUIRED")
    }

    if (body.externalUrl !== undefined) {
      updates.externalUrl = body.externalUrl
    }

    if (body.publishAt !== undefined) {
      const future = isFuture(body.publishAt)

      if (chapter.status === "PUBLISHED" && future) {
        return c.fail("CHAPTER_ALREADY_RELEASED")
      }

      updates.publishAt = toPublishAt(future ? body.publishAt : null)

      if (chapter.status === "SCHEDULED" && !future) {
        updates.status = "PUBLISHED"
        updates.createdAt = sql<Date>`CURRENT_TIMESTAMP`
      }
    }

    if (Object.keys(updates).length > 0) {
      await db.updateTable("chapters").set(updates).where("id", "=", chapter.id).execute()
    }

    return c.ok({ id: chapter.id })
  },
)
