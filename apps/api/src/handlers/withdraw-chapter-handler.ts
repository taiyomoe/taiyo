import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { deleteChapterPages } from "../chapter-pages"
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
      "Deletes a chapter the current user submitted while it is still waiting for review, along with its pages.\n\n**Authentication:** the uploader of the chapter.",
    tags: ["Chapter review"],
    responses: {
      201: {
        description: "Submission withdrawn.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No chapter with the given id exists.",
        409: "The chapter is not waiting for review.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth(),
  checkChapter({ unpublished: true }),
  withTransaction,
  async (c) => {
    const { can, chapter, db, s3, s3Bucket, user } = c.var
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
