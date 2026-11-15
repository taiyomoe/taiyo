import { chapterAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { deleteChapterPages } from "../chapter-pages"
import { audited } from "../middlewares/audited-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getChapterTarget } from "../utils/chapter-target"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const withdrawChapterHandler = new Hono().post(
  "/:id/withdraw",
  describeRoute({
    summary: "Withdraw a submitted chapter",
    description:
      "Withdraws a chapter you submitted while it is still uploading or waiting for review. The chapter and its pages are deleted.\n\n**Required access:** the user who uploaded the chapter.",
    tags: ["Chapter review"],
    responses: {
      201: {
        description: "Chapter withdrawn.",
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
        404: "No chapter with the given ID exists.",
        409: "The chapter is not uploading or waiting for review.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(chapterAudit.WITHDRAW),
  withAuth(),
  checkChapter({ unpublished: true }),
  withTransaction,
  async (c) => {
    const { can, chapter, db, s3, s3Bucket, user } = c.var

    c.var.audit.set({ target: { mediaId: chapter.mediaId } })

    const target = await getChapterTarget(db, chapter)

    if (!can("chapter.view", target)) {
      return c.fail("CHAPTER_NOT_FOUND")
    }

    const locked = await db
      .selectFrom("chapters")
      .select(["id", "mediaId", "status", "uploaderId", "pages"])
      .where("id", "=", chapter.id)
      .forUpdate()
      .executeTakeFirstOrThrow()

    if (!can("chapter.withdraw", { ...target, status: locked.status })) {
      return locked.status === "PENDING" || locked.status === "UPLOADING"
        ? c.fail("FORBIDDEN")
        : c.fail("CHAPTER_NOT_PENDING")
    }

    await db
      .updateTable("chapters")
      .set({ deletedAt: new Date(), deleterId: user.id, pages: null })
      .where("id", "=", chapter.id)
      .execute()

    c.var.afterCommit(() => deleteChapterPages({ s3, s3Bucket }, locked))

    return c.ok({ id: chapter.id })
  },
)
