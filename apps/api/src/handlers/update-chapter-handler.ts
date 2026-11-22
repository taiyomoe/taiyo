import { chapterAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { FLAGS, sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { omit } from "remeda"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { authorizeChapter } from "../middlewares/authorize-chapter-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { awardAchievements } from "../utils/achievements"
import { auditChanges } from "../utils/audit"
import { externalUrlSchema, isFuture, publishAtSchema, toPublishAt } from "../utils/chapter-release"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema, languageSchema } from "../utils/schemas"

const updateChapterSchema = z
  .object({
    title: z.string().min(1).max(config.input.maxChapterTitleLength).nullable().optional().meta({
      description: "The title of the chapter, or null to clear it.",
      example: "The Boy with the Sharingan",
    }),
    number: z
      .number()
      .nonnegative()
      .optional()
      .meta({ description: "The chapter number.", example: 112 }),
    volume: z
      .string()
      .min(1)
      .max(config.input.maxVolumeLength)
      .nullable()
      .optional()
      .meta({ description: "The volume of the chapter, or null to clear it.", example: "12" }),
    language: languageSchema("The language of the chapter.").optional(),
    contentRating: contentRatingSchema("The content rating of the chapter.").optional(),
    flag: z
      .enum(FLAGS)
      .optional()
      .meta({ description: "Who can read the chapter.", example: "OK" }),
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
      "Updates the details of a chapter. Omitted fields are kept as they are; at least one field is required. Setting `publishAt` to `null` or a past time releases a scheduled chapter right away, but a chapter that is already out cannot be scheduled again. An external chapter always keeps its `externalUrl`.\n\nChanging `flag` requires the uploader, moderator or admin role. The user who uploaded a scheduled chapter can only change its `publishAt`, unless they could also edit it once out.\n\n**Required access:** uploader or admin, a moderator, the uploader intern who uploaded it or a member of a credited group with the `EDIT_CHAPTERS` permission when the chapter is published or scheduled, or the user who uploaded the chapter while it is uploading, pending or scheduled.",
    tags: ["Chapters"],
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
        401: true,
        403: "You do not have permission to edit this chapter, to change its `flag`, or to change anything but its `publishAt`.",
        404: "No chapter with the given ID exists.",
        409: "The chapter is already out and cannot be scheduled again.",
        422: "The provided ID is not a valid UUID, the request body failed validation, or it removes the `externalUrl` of an external chapter.",
      }),
    },
  }),
  audited(chapterAudit.UPDATE),
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

    c.var.audit.set({
      target: { mediaId: chapter.mediaId },
      changes: auditChanges(chapter, omit(updates, ["createdAt"])),
    })

    if (Object.keys(updates).length > 0) {
      await db.updateTable("chapters").set(updates).where("id", "=", chapter.id).execute()
    }

    if (updates.status === "PUBLISHED") {
      await awardAchievements(c.var, chapter.uploaderId)
    }

    return c.ok({ id: chapter.id })
  },
)
