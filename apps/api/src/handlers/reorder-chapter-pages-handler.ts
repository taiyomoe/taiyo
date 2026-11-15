import { chapterAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { authorizeChapter } from "../middlewares/authorize-chapter-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const reorderSchema = z.object({
  pageIds: z
    .array(z.uuid())
    .min(1)
    .max(config.images.maxChapterPages)
    .meta({
      description: "The IDs of every page of the chapter, in the new order.",
      example: ["9f1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d", "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d"],
    }),
})

export const reorderChapterPagesHandler = new Hono().patch(
  "/:id/pages",
  describeRoute({
    summary: "Reorder a chapter's pages",
    description:
      "Reorders the pages of a chapter. The list must contain every page of the chapter exactly once.\n\n**Required access:** uploader or admin, a moderator or a member of a credited group with the `EDIT_CHAPTERS` permission when the chapter is published or scheduled, or the user who uploaded the chapter while it is uploading, pending or scheduled.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "Pages reordered.",
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
        409: "The chapter has no processed pages yet.",
        422: "The provided ID is not a valid UUID, the request body failed validation, or the page IDs do not list every page of the chapter exactly once.",
      }),
    },
  }),
  audited(chapterAudit.PAGES_REORDER),
  withAuth(),
  validateJson(reorderSchema),
  checkChapter({ unpublished: true }),
  authorizeChapter("update"),
  withTransaction,
  async (c) => {
    const { chapter, db } = c.var
    const { pageIds } = c.var.json

    c.var.audit.set({ target: { mediaId: chapter.mediaId } })

    const locked = await db
      .selectFrom("chapters")
      .select("pages")
      .where("id", "=", chapter.id)
      .forUpdate()
      .executeTakeFirstOrThrow()
    const current = (locked.pages ?? []).map((page) => page.id)

    if (current.length === 0) {
      return c.fail("CHAPTER_PAGES_MISSING")
    }

    if (
      pageIds.length !== current.length ||
      new Set(pageIds).size !== pageIds.length ||
      !pageIds.every((id) => current.includes(id))
    ) {
      return c.fail("CHAPTER_PAGES_MISMATCH")
    }

    await db
      .updateTable("chapters")
      .set({ pages: pageIds.map((id) => ({ id })) })
      .where("id", "=", chapter.id)
      .execute()

    return c.ok({ id: chapter.id })
  },
)
