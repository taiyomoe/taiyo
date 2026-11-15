import { historyAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const SECONDS_PER_PAGE = 2
const PAGES_PER_POINT = 20
const DAILY_PAGE_LIMIT = 1200
const rewardSchema = z
  .object({
    pages: z
      .int()
      .meta({ description: "The number of pages of the chapter that earned credit.", example: 19 }),
    points: z
      .int()
      .meta({ description: "The number of points added to your balance.", example: 1 }),
  })
  .nullable()
  .meta({
    description:
      "What finishing the chapter earned you, or null when it earned nothing: the request did not complete it, the chapter number was already credited, you uploaded it, the daily limit is reached, or not enough time passed since you opened it or last earned credit.",
  })
const updateHistorySchema = z
  .object({
    pageId: z.uuid().nullable().optional().meta({
      description: "The ID of the page you are on, or null to clear it.",
      example: "9f1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d",
    }),
    completed: z
      .boolean()
      .optional()
      .meta({ description: "Whether you finished the chapter.", example: true }),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  })

export const updateChapterHistoryHandler = new Hono().patch(
  "/:id/history",
  describeRoute({
    summary: "Update the reading progress of a chapter",
    description: `Updates your progress on a published chapter: the page you are on and whether you finished it. At least one field is required, and you must have opened the chapter first.\n\nFinishing a chapter credits its pages towards points, one point per ${PAGES_PER_POINT} pages, once per chapter number. Credit accrues at most one page per ${SECONDS_PER_PAGE} seconds, counted from when you opened the chapter or last earned credit, whichever is later, and at most ${DAILY_PAGE_LIMIT} pages per 24 hours.\n\n**Authentication:** signed-in user.`,
    tags: ["Reading history"],
    responses: {
      200: {
        description: "Progress updated.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  userId: z.uuid().meta({ description: "Your user ID." }),
                  chapterId: z.uuid().meta({ description: "The ID of the chapter." }),
                  reward: rewardSchema,
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No chapter with the given ID exists, or you have not opened it yet.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(historyAudit.PROGRESS_UPDATE),
  withAuth(),
  validateJson(updateHistorySchema),
  checkChapter(),
  withTransaction,
  async (c) => {
    const { db, user, chapter } = c.var
    const body = c.var.json
    const updates: Record<string, unknown> = {}

    if (body.pageId !== undefined) {
      updates.pageId = body.pageId
    }

    if (body.completed !== undefined) {
      updates.completed = body.completed
    }

    c.var.audit.set({ target: { pageId: body.pageId, completed: body.completed } })

    const result = await db
      .updateTable("userHistories")
      .set(updates)
      .where("userId", "=", user.id)
      .where("chapterId", "=", chapter.id)
      .executeTakeFirst()

    if (result.numUpdatedRows === 0n) {
      return c.fail("HISTORY_ENTRY_NOT_FOUND")
    }

    const profile =
      body.completed === true && chapter.uploaderId !== user.id
        ? await db
            .selectFrom("userProfiles")
            .select("id")
            .where("userId", "=", user.id)
            .forUpdate()
            .executeTakeFirst()
        : undefined

    if (profile === undefined) {
      return c.ok({ userId: user.id, chapterId: chapter.id, reward: null })
    }

    const credited = sql.ref("readingRewards.pages")
    const stats = await db
      .selectFrom("userHistories")
      .leftJoin("readingRewards", "readingRewards.userId", "userHistories.userId")
      .where("userHistories.userId", "=", user.id)
      .where("userHistories.chapterId", "=", chapter.id)
      .groupBy("userHistories.createdAt")
      .select([
        sql<string>`extract(epoch from localtimestamp - greatest(${sql.ref("userHistories.createdAt")}, max(${sql.ref("readingRewards.createdAt")})))`.as(
          "elapsed",
        ),
        sql<string>`coalesce(sum(${credited}), 0)`.as("total"),
        sql<string>`coalesce(sum(${credited}) filter (where ${sql.ref("readingRewards.createdAt")} > localtimestamp - interval '1 day'), 0)`.as(
          "today",
        ),
        sql<string>`coalesce(sum(${credited}) filter (where ${sql.ref("readingRewards.mediaId")} = ${chapter.mediaId} and ${sql.ref("readingRewards.number")} = ${chapter.number}), 0)`.as(
          "claimed",
        ),
      ])
      .executeTakeFirstOrThrow()
    const total = Number(stats.total)
    const pages = Math.min(
      (chapter.pages?.length ?? 0) - Number(stats.claimed),
      Math.floor(Number(stats.elapsed) / SECONDS_PER_PAGE),
      DAILY_PAGE_LIMIT - Number(stats.today),
    )

    if (pages <= 0) {
      return c.ok({ userId: user.id, chapterId: chapter.id, reward: null })
    }

    const points =
      Math.floor((total + pages) / PAGES_PER_POINT) - Math.floor(total / PAGES_PER_POINT)

    await db
      .insertInto("readingRewards")
      .values({
        userId: user.id,
        chapterId: chapter.id,
        mediaId: chapter.mediaId,
        number: chapter.number,
        pages,
        points,
      })
      .execute()

    if (points > 0) {
      await db
        .updateTable("userProfiles")
        .set((eb) => ({ points: eb("points", "+", points) }))
        .where("id", "=", profile.id)
        .execute()
    }

    return c.ok({ userId: user.id, chapterId: chapter.id, reward: { pages, points } })
  },
)
