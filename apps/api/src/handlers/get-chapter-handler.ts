import { CHAPTER_STATUSES, CONTENT_RATINGS, FLAGS, LANGUAGES } from "@taiyomoe/db"
import { getChapterPageKey, S3_PUBLIC_BASE } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { authorizeChapterView } from "../middlewares/authorize-chapter-view-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { publishAtIso } from "../utils/chapter-release"
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
  status: z.enum(CHAPTER_STATUSES).meta({
    description:
      "PUBLISHED, SCHEDULED until its release, UPLOADING while its pages are processed, or PENDING / REJECTED for chapters in review.",
  }),
  pages: z
    .object({
      id: z.uuid().meta({
        description: "The ID of the page.",
        example: "13548c83-8d1a-4163-8830-c8f16fcd2eb7",
      }),
      url: z.url().meta({
        description: "URL of the page image.",
        example:
          "https://cdn.taiyo.moe/medias/4e26b80f-6661-4f5f-93b4-6dfed052bbed/chapters/13548c83-8d1a-4163-8830-c8f16fcd2eb7/9f1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d.jpg",
      }),
    })
    .array()
    .nullable()
    .meta({ description: "The pages of the chapter, in reading order." }),
  publishAt: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When the chapter goes live, if it was scheduled." }),
  externalUrl: z
    .string()
    .nullable()
    .meta({ description: "Link to the chapter on the group's own site, if any." }),
  isExternal: z
    .boolean()
    .meta({ description: "Whether the chapter is only hosted on the group's site." }),
  createdAt: z.iso.datetime().meta({ description: "When the chapter was created." }),
  updatedAt: z.iso.datetime().meta({ description: "When the chapter was last updated." }),
})

export const getChapterHandler = new Hono().get(
  "/:id",
  describeRoute({
    summary: "Get a chapter",
    description:
      "Fetches a chapter by id, including its pages in reading order.\n\n**Authentication:** none.",
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
  withOptionalAuth,
  checkChapter({ unpublished: true }),
  authorizeChapterView,
  async (c) => {
    const { chapter, db } = c.var
    const { publishAt } = await db
      .selectFrom("chapters")
      .select(publishAtIso.as("publishAt"))
      .where("id", "=", chapter.id)
      .executeTakeFirstOrThrow()

    return c.ok({
      id: chapter.id,
      mediaId: chapter.mediaId,
      title: chapter.title,
      number: chapter.number,
      volume: chapter.volume,
      language: chapter.language,
      contentRating: chapter.contentRating,
      flag: chapter.flag,
      status: chapter.status,
      pages:
        chapter.pages?.map((page) => ({
          id: page.id,
          url: `${S3_PUBLIC_BASE}/${getChapterPageKey(chapter.mediaId, chapter.id, page.id)}`,
        })) ?? null,
      publishAt,
      externalUrl: chapter.externalUrl,
      isExternal: chapter.isExternal,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
    })
  },
)
