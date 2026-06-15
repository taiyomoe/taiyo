import { CONTENT_RATINGS, FLAGS, LANGUAGES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const chapterDetailSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the chapter." }),
  mediaId: z.uuid().meta({ description: "The ID of the media this chapter belongs to." }),
  title: z.string().nullable().meta({ description: "Title of the chapter, if any." }),
  number: z.number().meta({ description: "Chapter number." }),
  volume: z.string().nullable().meta({ description: "Volume of the chapter, if any." }),
  language: z.enum(LANGUAGES).meta({ description: "Language of the chapter." }),
  contentRating: z.enum(CONTENT_RATINGS).meta({ description: "Content rating." }),
  flag: z.enum(FLAGS).meta({ description: "Visibility flag." }),
  pages: z
    .object({ id: z.uuid() })
    .array()
    .nullable()
    .meta({ description: "Page references, if any have been uploaded." }),
  createdAt: z.iso.datetime().meta({ description: "When the chapter was created." }),
  updatedAt: z.iso.datetime().meta({ description: "When the chapter was last updated." }),
})

export const getChapterHandler = new Hono().get(
  "/:id",
  describeRoute({
    summary: "Get a chapter",
    description: "Fetches a chapter by id.\n\n**Authentication:** none.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "Chapter details.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(chapterDetailSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No chapter with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  checkChapter(),
  async (c) => {
    const { chapter } = c.var

    return c.ok({
      id: chapter.id,
      mediaId: chapter.mediaId,
      title: chapter.title,
      number: chapter.number,
      volume: chapter.volume,
      language: chapter.language,
      contentRating: chapter.contentRating,
      flag: chapter.flag,
      pages: chapter.pages,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
    })
  },
)
