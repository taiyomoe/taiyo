import { CHAPTER_STATUSES, FLAGS } from "@taiyomoe/db"
import { getChapterPageKey, S3_PUBLIC_BASE } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { authorizeChapterView } from "../middlewares/authorize-chapter-view-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { publishAtIso } from "../utils/chapter-release"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema, storedLanguageSchema } from "../utils/schemas"

const chapterDetailSchema = z.object({
  id: z.uuid().meta({
    description: "The ID of the chapter.",
    example: "13548c83-8d1a-4163-8830-c8f16fcd2eb7",
  }),
  mediaId: z.uuid().meta({
    description: "The ID of the media the chapter belongs to.",
    example: "4e26b80f-6661-4f5f-93b4-6dfed052bbed",
  }),
  title: z.string().nullable().meta({
    description: "The title of the chapter, if any.",
    example: "The Boy with the Sharingan",
  }),
  number: z.number().meta({ description: "The chapter number.", example: 112 }),
  volume: z
    .string()
    .nullable()
    .meta({ description: "The volume of the chapter, if any.", example: "12" }),
  language: storedLanguageSchema("The language of the chapter."),
  contentRating: contentRatingSchema("The content rating of the chapter."),
  flag: z.enum(FLAGS).meta({ description: "Who can read the chapter.", example: "OK" }),
  status: z.enum(CHAPTER_STATUSES).meta({
    description:
      "Where the chapter stands: PUBLISHED, SCHEDULED until its release, UPLOADING while its pages are processed, or PENDING and REJECTED for chapters in review.",
    example: "PUBLISHED",
  }),
  pages: z
    .object({
      id: z.uuid().meta({
        description: "The ID of the page.",
        example: "9f1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d",
      }),
      url: z.url().meta({
        description: "The URL of the page image.",
        example:
          "https://cdn.taiyo.moe/medias/4e26b80f-6661-4f5f-93b4-6dfed052bbed/chapters/13548c83-8d1a-4163-8830-c8f16fcd2eb7/9f1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d.jpg",
      }),
    })
    .array()
    .nullable()
    .meta({ description: "The pages of the chapter, in reading order, if any." }),
  publishAt: z.iso.datetime().nullable().meta({
    description: "When the chapter goes live, if it was scheduled.",
    example: "2026-11-01T18:00:00.000Z",
  }),
  externalUrl: z.string().nullable().meta({
    description: "The link to the chapter on the group's own site, if any.",
    example: "https://sunray-scans.com/boruto/112",
  }),
  isExternal: z
    .boolean()
    .meta({ description: "Whether the chapter is only hosted on the group's site." }),
  createdAt: z.iso.datetime().meta({
    description: "When the chapter was released, or uploaded if it is not released yet.",
  }),
  updatedAt: z.iso.datetime().meta({ description: "When the chapter was last updated." }),
})

export const getChapterHandler = new Hono().get(
  "/:id",
  describeRoute({
    summary: "Get a chapter",
    description:
      "Returns a chapter by ID, with its pages in reading order. A chapter that is not published yet is only visible to uploaders, admins and the user who uploaded it, and once scheduled also to moderators and members of a credited group with the `EDIT_CHAPTERS` permission.\n\n**Authentication:** optional.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "The chapter.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(chapterDetailSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No chapter with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
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
