import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { idsQuerySchema } from "../utils/bulk"
import {
  chapterDeletionImpactSchema,
  getChapterDeletionImpact,
} from "../utils/chapter-deletion-impact"
import { getChapterTargets } from "../utils/chapter-target"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const querySchema = z.object({
  ids: idsQuerySchema("chapters", [
    "13548c83-8d1a-4163-8830-c8f16fcd2eb7",
    "9f1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d",
  ]),
})

export const getChaptersDeletionImpactHandler = new Hono().get(
  "/deletion-impact",
  describeRoute({
    summary: "Get what deleting several chapters affects",
    description:
      "Returns what disappears from the site if you delete these chapters together, counted across all of them. Chapters that do not exist or that you cannot delete count for nothing.\n\n**Authentication:** signed-in user.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "What deleting the chapters affects.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(chapterDeletionImpactSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The query parameters failed validation.",
      }),
    },
  }),
  withAuth(),
  validateQuery(querySchema),
  async (c) => {
    const { can, db } = c.var
    const rows = await db
      .selectFrom("chapters")
      .innerJoin("medias", "medias.id", "chapters.mediaId")
      .select(["chapters.id", "chapters.uploaderId", "chapters.status"])
      .where("chapters.id", "in", c.var.query.ids)
      .where("chapters.deletedAt", "is", null)
      .where("medias.deletedAt", "is", null)
      .execute()
    const targets = await getChapterTargets(db, rows)
    const deletable = rows.filter((row) => {
      const target = targets.get(row.id)

      return target !== undefined && can("chapter.delete", target)
    })

    return c.ok(
      await getChapterDeletionImpact(
        db,
        deletable.map((row) => row.id),
      ),
    )
  },
)
