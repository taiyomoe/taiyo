import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { authorizeChapter } from "../middlewares/authorize-chapter-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import {
  chapterDeletionImpactSchema,
  getChapterDeletionImpact,
} from "../utils/chapter-deletion-impact"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const getChapterDeletionImpactHandler = new Hono().get(
  "/:id/deletion-impact",
  describeRoute({
    summary: "Get what deleting a chapter affects",
    description:
      "Returns what disappears from the site if you delete the chapter: its pages, the reading history and bookmarks of its readers, its comments and its page reports, counted.\n\n**Required access:** uploader or admin, or a moderator, the uploader intern who uploaded it or a member of a credited group with the `DELETE_CHAPTERS` permission when the chapter is published or scheduled.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "What deleting the chapter affects.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(chapterDeletionImpactSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No chapter with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  withAuth(),
  checkChapter({ unpublished: true }),
  authorizeChapter("delete"),
  async (c) => {
    const { db, chapter } = c.var

    return c.ok(await getChapterDeletionImpact(db, [chapter.id]))
  },
)
