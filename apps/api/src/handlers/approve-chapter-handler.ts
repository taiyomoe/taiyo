import { config } from "@taiyomoe/config"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, languageSchema } from "../utils/schemas"

const approveSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1)
    .max(config.input.maxChapterTitleLength)
    .nullable()
    .optional()
    .meta({ description: "Corrected title, or null to clear it." }),
  number: z.number().nonnegative().optional().meta({ description: "Corrected chapter number." }),
  volume: z
    .string()
    .trim()
    .min(1)
    .max(config.input.maxVolumeLength)
    .nullable()
    .optional()
    .meta({ description: "Corrected volume, or null to clear it." }),
  language: languageSchema("Corrected language.").optional(),
  groupIds: z
    .array(z.uuid())
    .max(config.input.maxChapterGroups)
    .optional()
    .meta({ description: "Corrected list of credited groups. Replaces the current credits." }),
})

export const approveChapterHandler = new Hono().post(
  "/:id/approve",
  describeRoute({
    summary: "Approve a submitted chapter",
    description:
      "Publishes a chapter that was waiting for review, optionally correcting its details and credits first. The chapter then shows up as just released. It must have processed pages.\n\n**Required roles:** uploader, admin.",
    tags: ["Chapter review"],
    requestBody: {
      content: { "application/json": await resolver(approveSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Chapter published.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No chapter with the given id exists, or one of the groups does not exist.",
        409: "The chapter is not waiting for review, or has no pages yet.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("chapter.review"),
  validateJson(approveSchema),
  checkChapter({ unpublished: true }),
  withTransaction,
  async (c) => {
    const { chapter, db, user } = c.var
    const body = c.var.json
    const locked = await db
      .selectFrom("chapters")
      .select(["status", "pages"])
      .where("id", "=", chapter.id)
      .forUpdate()
      .executeTakeFirstOrThrow()

    if (locked.status !== "PENDING") {
      return c.fail("CHAPTER_NOT_PENDING")
    }

    if (locked.pages === null || locked.pages.length === 0) {
      return c.fail("CHAPTER_PAGES_MISSING")
    }

    if (body.groupIds !== undefined) {
      const groupIds = [...new Set(body.groupIds)]
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

      await db.deleteFrom("chapterGroups").where("chapterId", "=", chapter.id).execute()

      if (groupIds.length > 0) {
        await db
          .insertInto("chapterGroups")
          .values(groupIds.map((groupId) => ({ chapterId: chapter.id, groupId })))
          .execute()
      }
    }

    await db
      .updateTable("chapters")
      .set({
        ...(body.title === undefined ? {} : { title: body.title }),
        ...(body.number === undefined ? {} : { number: body.number }),
        ...(body.volume === undefined ? {} : { volume: body.volume }),
        ...(body.language === undefined ? {} : { language: body.language }),
        status: "PUBLISHED",
        reviewerId: user.id,
        reviewedAt: sql<Date>`CURRENT_TIMESTAMP`,
        createdAt: sql<Date>`CURRENT_TIMESTAMP`,
      })
      .where("id", "=", chapter.id)
      .execute()

    return c.ok({ id: chapter.id })
  },
)
