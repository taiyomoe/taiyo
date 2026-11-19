import { chapterReviewAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { awardAchievements } from "../utils/achievements"
import { auditChanges } from "../utils/audit"
import { readyCreatedAt, readyStatus } from "../utils/chapter-release"
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
    .meta({
      description: "The corrected title of the chapter, or null to clear it.",
      example: "The Boy with the Sharingan",
    }),
  number: z
    .number()
    .nonnegative()
    .optional()
    .meta({ description: "The corrected chapter number.", example: 112 }),
  volume: z.string().trim().min(1).max(config.input.maxVolumeLength).nullable().optional().meta({
    description: "The corrected volume of the chapter, or null to clear it.",
    example: "12",
  }),
  language: languageSchema("The corrected language of the chapter.").optional(),
  groupIds: z
    .array(z.uuid())
    .max(config.input.maxChapterGroups)
    .optional()
    .meta({
      description: "The IDs of the groups to credit on the chapter. Replaces the current credits.",
      example: ["13548c83-8d1a-4163-8830-c8f16fcd2eb7"],
    }),
})

export const approveChapterHandler = new Hono().post(
  "/:id/approve",
  describeRoute({
    summary: "Approve a submitted chapter",
    description:
      "Approves a chapter waiting for review, optionally correcting its details and credits first. The chapter is released right away as a new chapter, or at its `publishAt` time if that is still ahead. It must have processed pages, unless it is only hosted on the group's site.\n\n**Required roles:** uploader, admin.",
    tags: ["Chapter review"],
    responses: {
      201: {
        description: "Chapter approved.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ id: z.uuid().meta({ description: "The ID of the chapter." }) }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No chapter with the given ID exists, or one of the groups does not exist.",
        451: "The chapter's media is locked, so the chapter cannot be published.",
        409: "The chapter is not waiting for review, or it has no processed pages yet.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(chapterReviewAudit.APPROVE),
  withAuth("chapter.review"),
  validateJson(approveSchema),
  checkChapter({ unpublished: true, refuseLocked: true }),
  withTransaction,
  async (c) => {
    const { chapter, db, user } = c.var
    const body = c.var.json
    const edits = {
      ...(body.title === undefined ? {} : { title: body.title }),
      ...(body.number === undefined ? {} : { number: body.number }),
      ...(body.volume === undefined ? {} : { volume: body.volume }),
      ...(body.language === undefined ? {} : { language: body.language }),
    }

    c.var.audit.set({ target: { mediaId: chapter.mediaId } })

    const locked = await db
      .selectFrom("chapters")
      .select(["status", "pages", "isExternal"])
      .where("id", "=", chapter.id)
      .forUpdate()
      .executeTakeFirstOrThrow()

    if (locked.status !== "PENDING") {
      return c.fail("CHAPTER_NOT_PENDING")
    }

    if (!locked.isExternal && (locked.pages === null || locked.pages.length === 0)) {
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

    c.var.audit.set({ changes: auditChanges(chapter, edits) })

    const { status } = await db
      .updateTable("chapters")
      .set({
        ...edits,
        status: readyStatus,
        reviewerId: user.id,
        reviewedAt: sql<Date>`CURRENT_TIMESTAMP`,
        createdAt: readyCreatedAt,
      })
      .where("id", "=", chapter.id)
      .returning("status")
      .executeTakeFirstOrThrow()

    if (status === "PUBLISHED") {
      await awardAchievements(c.var, chapter.uploaderId)
    }

    return c.ok({ id: chapter.id })
  },
)
