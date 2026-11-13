import { LANGUAGES, sql } from "@taiyomoe/db"
import { getChapterPageKey, S3_PUBLIC_BASE } from "@taiyomoe/s3"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  mediaId: z
    .uuid()
    .optional()
    .meta({ description: "Only list bookmarks on chapters of this media." }),
})
const bookmarkSchema = z.object({
  chapterId: z.uuid(),
  pageId: z.uuid(),
  page: z.int().meta({ description: "The bookmarked page's position in the chapter, from 1." }),
  url: z.url().meta({ description: "The page image." }),
  mediaId: z.uuid(),
  chapterNumber: z.number(),
  chapterTitle: z.string().nullable(),
  chapterLanguage: z.enum(LANGUAGES),
  createdAt: z.iso.datetime(),
})

export const listMyBookmarksHandler = new Hono().get(
  "/me/bookmarks",
  describeRoute({
    summary: "List my page bookmarks",
    description:
      "Returns your page bookmarks, newest first. Bookmarks on deleted or unpublished chapters, or on pages that were removed from their chapter, are left out.\n\n**Authentication:** signed-in user.",
    tags: ["Bookmarks"],
    responses: {
      200: {
        description: "Your page bookmarks.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(bookmarkSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        422: "The query parameters failed validation.",
      }),
    },
  }),
  withAuth(),
  validateQuery(querySchema),
  async (c) => {
    const { db, user } = c.var
    const { page, perPage, mediaId } = c.var.query
    const base = db
      .selectFrom("pageBookmarks")
      .innerJoin("chapters", "chapters.id", "pageBookmarks.chapterId")
      .innerJoin("medias", "medias.id", "chapters.mediaId")
      .where(
        sql<boolean>`exists (select 1 from unnest(${sql.ref("chapters.pages")}) as p(page) where ${sql.ref("p.page")}->>'id' = ${sql.ref("pageBookmarks.pageId")}::text)`,
      )
      .where("pageBookmarks.userId", "=", user.id)
      .where("chapters.deletedAt", "is", null)
      .where("chapters.status", "=", "PUBLISHED")
      .where("medias.deletedAt", "is", null)
      .$if(mediaId !== undefined, (qb) => qb.where("chapters.mediaId", "=", mediaId ?? ""))
    const [rows, totalRow] = await Promise.all([
      base
        .select([
          "pageBookmarks.chapterId",
          "pageBookmarks.pageId",
          sql<number>`(select ${sql.ref("p.ord")}::int from unnest(${sql.ref("chapters.pages")}) with ordinality as p(page, ord) where ${sql.ref("p.page")}->>'id' = ${sql.ref("pageBookmarks.pageId")}::text)`.as(
            "page",
          ),
          "chapters.mediaId",
          "chapters.number as chapterNumber",
          "chapters.title as chapterTitle",
          "chapters.language as chapterLanguage",
          "pageBookmarks.createdAt",
        ])
        .orderBy("pageBookmarks.createdAt", "desc")
        .orderBy("pageBookmarks.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(db.fn.countAll().as("count")).executeTakeFirstOrThrow(),
    ])

    return c.ok(
      rows.map((row) => ({
        ...row,
        url: `${S3_PUBLIC_BASE}/${getChapterPageKey(row.mediaId, row.chapterId, row.pageId)}`,
      })),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
