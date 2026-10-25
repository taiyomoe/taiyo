import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
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
    .meta({ description: "Every page ID of the chapter, in the new order." }),
})

export const reorderChapterPagesHandler = new Hono().patch(
  "/:id/pages",
  describeRoute({
    summary: "Reorder a chapter's pages",
    description:
      "Sets the order of the chapter's pages. The list must contain every page of the chapter exactly once.\n\n**Authentication:** uploader, moderator, admin — or a member with `EDIT_CHAPTERS` in a group credited on the chapter, or the uploader of a chapter waiting for review.",
    tags: ["Chapters"],
    requestBody: {
      content: { "application/json": await resolver(reorderSchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Pages reordered.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No chapter with the given id exists.",
        409: "The chapter has no processed pages yet.",
        422: "The list does not match the chapter's pages.",
      }),
    },
  }),
  withAuth(),
  validateJson(reorderSchema),
  checkChapter({ unpublished: true }),
  authorizeChapter("update"),
  withTransaction,
  async (c) => {
    const { chapter, db } = c.var
    const { pageIds } = c.var.json
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
