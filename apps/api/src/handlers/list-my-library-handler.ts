import {
  type Language,
  MEDIA_STATUSES,
  MEDIA_TYPES,
  type MediaStatus,
  type MediaType,
  sql,
  USER_LIBRARY_STATUSES,
  type UserLibraryStatus,
} from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getMainCoverUrls } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingsQuerySchema,
  storedLanguageSchema,
} from "../utils/schemas"

export const LIBRARY_SORTS = ["read", "updated", "added", "released", "title"] as const

const ORDER_BY = {
  read: sql`"lastReadAt" desc nulls last, "updatedAt" desc`,
  updated: sql`"updatedAt" desc`,
  added: sql`"createdAt" desc`,
  released: sql`"latestChapterAt" desc nulls last, "updatedAt" desc`,
  title: sql`"title" asc nulls last`,
} satisfies Record<(typeof LIBRARY_SORTS)[number], unknown>
const querySchema = paginationQuerySchema.extend({
  status: z.enum(USER_LIBRARY_STATUSES).optional().meta({
    description: "Only list the entries with this status. Defaults to every status.",
    example: "READING",
  }),
  sort: z.enum(LIBRARY_SORTS).default("read").meta({
    description:
      "How to order the entries: `read` puts the media you read last first, `updated` the entries you changed last, `added` the ones you added last, `released` the media with the newest chapters, and `title` sorts by main title.",
    example: "read",
  }),
  q: z.string().trim().max(100).optional().meta({
    description: "Only list the media with a title containing this text.",
    example: "berserk",
  }),
  contentRating: contentRatingsQuerySchema,
})
const chapterRefSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the chapter." }),
  number: z.number().meta({ description: "The chapter number.", example: 118 }),
  language: storedLanguageSchema("The language of the chapter."),
})
const libraryItemSchema = z.object({
  mediaId: z.uuid().meta({ description: "The ID of the media." }),
  status: z
    .enum(USER_LIBRARY_STATUSES)
    .meta({ description: "The status of the media in your library.", example: "READING" }),
  notify: z.boolean().meta({ description: "Whether new chapters of the media notify you." }),
  createdAt: z.iso.datetime().meta({ description: "When you added the media to your library." }),
  updatedAt: z.iso.datetime().meta({ description: "When you last changed the entry." }),
  media: z
    .object({
      title: z
        .string()
        .nullable()
        .meta({ description: "The main title of the media, if any.", example: "Berserk" }),
      coverUrl: z
        .url()
        .nullable()
        .meta({ description: "The URL of the main cover of the media, if any." }),
      type: z.enum(MEDIA_TYPES).meta({ description: "The type of the media.", example: "MANGA" }),
      status: z
        .enum(MEDIA_STATUSES)
        .meta({ description: "The publication status of the media.", example: "RELEASING" }),
    })
    .meta({ description: "The media of the entry." }),
  readCount: z.int().meta({
    description: "The number of distinct chapter numbers you have read.",
    example: 87,
  }),
  totalCount: z.int().meta({
    description: "The number of distinct chapter numbers the media has.",
    example: 120,
  }),
  latestChapterAt: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When the newest chapter of the media came out, if any." }),
  lastRead: chapterRefSchema
    .extend({
      readAt: z.iso.datetime().meta({ description: "When you last opened the chapter." }),
      completed: z.boolean().meta({ description: "Whether you finished the chapter." }),
      page: z.int().nullable().meta({
        description: "The page you were last on, counted from 1, if any.",
        example: 14,
      }),
    })
    .nullable()
    .meta({ description: "The chapter of the media you opened most recently, if any." }),
  next: chapterRefSchema.nullable().meta({
    description:
      "The first chapter after the one you read last whose number you have not finished, or the first chapter if you have read none. Null once you are caught up.",
  }),
})

type Row = {
  mediaId: string
  status: UserLibraryStatus
  notify: boolean
  createdAt: Date
  updatedAt: Date
  title: string | null
  mediaType: MediaType
  mediaStatus: MediaStatus
  readCount: string | null
  totalCount: string | null
  latestChapterAt: Date | null
  lastReadId: string | null
  lastReadNumber: number | null
  lastReadLanguage: Language | null
  lastReadAt: Date | null
  lastReadCompleted: boolean | null
  lastReadPageId: string | null
  lastReadPage: number | null
  nextId: string | null
  nextNumber: number | null
  nextLanguage: Language | null
}

export const listMyLibraryHandler = new Hono().get(
  "/me/library",
  describeRoute({
    summary: "List my library",
    description:
      "Lists the entries of your library with your reading progress on each media, counting only chapters that match the content ratings.\n\n**Authentication:** signed-in user.",
    tags: ["Library"],
    responses: {
      200: {
        description: "Your library.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(libraryItemSchema.array(), paginationMetaSchema)),
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
    const { db, user } = c.var
    const { page, perPage, status, sort, q, contentRating } = c.var.query
    const pattern = q === undefined || q === "" ? null : `%${q.replace(/[\\%_]/g, "\\$&")}%`
    const fromEntries = sql`
      from "userLibraryEntries" "e"
      inner join "medias" "m" on "m"."id" = "e"."mediaId"
      where "e"."userId" = ${user.id}
        and "m"."deletedAt" is null
        and (${status ?? null}::text is null or "e"."status"::text = ${status ?? null})
        and (${pattern}::text is null or exists (
          select 1 from "titles" "t"
          where "t"."mediaId" = "e"."mediaId" and "t"."deletedAt" is null and "t"."title" ilike ${pattern}
        ))
    `
    const [{ rows }, { rows: totalRows }] = await Promise.all([
      sql<Row>`
      with "entries" as (
        select
          "e"."mediaId", "e"."status", "e"."notify", "e"."createdAt", "e"."updatedAt",
          "m"."type" as "mediaType", "m"."status" as "mediaStatus",
          (
            select "t"."title" from "titles" "t"
            where "t"."mediaId" = "e"."mediaId" and "t"."isMainTitle" and "t"."deletedAt" is null
            limit 1
          ) as "title"
        ${fromEntries}
      ),
      "visible" as (
        select "c"."id", "c"."mediaId", "c"."number", "c"."language", "c"."createdAt"
        from "chapters" "c"
        inner join "medias" "m" on "m"."id" = "c"."mediaId"
        where "c"."mediaId" in (select "mediaId" from "entries")
          and "c"."deletedAt" is null
          and "c"."status" = 'PUBLISHED'
          and greatest("m"."contentRating", "c"."contentRating")::text = any(${contentRating})
      ),
      "readNumbers" as (
        select "c"."mediaId", "c"."number", bool_or("h"."completed") as "completed"
        from "userHistories" "h"
        inner join "chapters" "c" on "c"."id" = "h"."chapterId"
        where "h"."userId" = ${user.id}
          and "c"."mediaId" in (select "mediaId" from "entries")
          and "c"."deletedAt" is null
          and "c"."status" = 'PUBLISHED'
        group by "c"."mediaId", "c"."number"
      ),
      "stats" as (
        select
          "v"."mediaId",
          count(distinct "v"."number") as "totalCount",
          count(distinct "v"."number") filter (where "r"."number" is not null) as "readCount",
          max("v"."createdAt") as "latestAt"
        from "visible" "v"
        left join "readNumbers" "r" on "r"."mediaId" = "v"."mediaId" and "r"."number" = "v"."number"
        group by "v"."mediaId"
      ),
      "lastRead" as (
        select distinct on ("v"."mediaId")
          "v"."mediaId", "v"."id", "v"."number", "v"."language",
          "h"."updatedAt" as "readAt", "h"."completed", "h"."pageId"
        from "userHistories" "h"
        inner join "visible" "v" on "v"."id" = "h"."chapterId"
        where "h"."userId" = ${user.id}
          and (not "h"."completed" or "h"."pageId" is not null)
        order by "v"."mediaId", "h"."updatedAt" desc, "v"."id" desc
      ),
      "next" as (
        select distinct on ("v"."mediaId") "v"."mediaId", "v"."id", "v"."number", "v"."language"
        from "visible" "v"
        left join "lastRead" "l" on "l"."mediaId" = "v"."mediaId"
        left join "readNumbers" "r" on "r"."mediaId" = "v"."mediaId" and "r"."number" = "v"."number"
        where ("l"."number" is null or "v"."number" > "l"."number")
          and "r"."completed" is not true
        order by
          "v"."mediaId",
          "v"."number" asc,
          ("v"."language" = "l"."language") desc nulls last,
          "v"."createdAt" asc
      ),
      "paged" as (
        select
          "entries".*,
          "stats"."readCount", "stats"."totalCount", "stats"."latestAt" as "latestChapterAt",
          "lastRead"."id" as "lastReadId", "lastRead"."number" as "lastReadNumber",
          "lastRead"."language" as "lastReadLanguage", "lastRead"."readAt" as "lastReadAt",
          "lastRead"."completed" as "lastReadCompleted", "lastRead"."pageId" as "lastReadPageId"
        from "entries"
        left join "stats" on "stats"."mediaId" = "entries"."mediaId"
        left join "lastRead" on "lastRead"."mediaId" = "entries"."mediaId"
        order by ${ORDER_BY[sort]}, "mediaId" desc
        limit ${perPage}
        offset ${(page - 1) * perPage}
      )
      select
        "paged".*,
        (
          select "p"."ord"::int
          from "chapters" "pc", unnest("pc"."pages") with ordinality as "p"("page", "ord")
          where "pc"."id" = "paged"."lastReadId" and "p"."page"->>'id' = "paged"."lastReadPageId"::text
        ) as "lastReadPage",
        "next"."id" as "nextId", "next"."number" as "nextNumber", "next"."language" as "nextLanguage"
      from "paged"
      left join "next" on "next"."mediaId" = "paged"."mediaId"
      order by ${ORDER_BY[sort]}, "mediaId" desc
    `.execute(db),
      sql<{ count: string }>`select count(*) as "count" ${fromEntries}`.execute(db),
    ])
    const covers = await getMainCoverUrls(
      db,
      rows.map((row) => row.mediaId),
    )

    return c.ok(
      rows.map((row) => ({
        mediaId: row.mediaId,
        status: row.status,
        notify: row.notify,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        media: {
          title: row.title,
          coverUrl: covers.get(row.mediaId) ?? null,
          type: row.mediaType,
          status: row.mediaStatus,
        },
        readCount: Number(row.readCount ?? 0),
        totalCount: Number(row.totalCount ?? 0),
        latestChapterAt: row.latestChapterAt,
        lastRead:
          row.lastReadId === null ||
          row.lastReadNumber === null ||
          row.lastReadLanguage === null ||
          row.lastReadAt === null
            ? null
            : {
                id: row.lastReadId,
                number: row.lastReadNumber,
                language: row.lastReadLanguage,
                readAt: row.lastReadAt,
                completed: row.lastReadCompleted === true,
                page: row.lastReadPage,
              },
        next:
          row.nextId === null || row.nextNumber === null || row.nextLanguage === null
            ? null
            : { id: row.nextId, number: row.nextNumber, language: row.nextLanguage },
      })),
      { page, perPage, total: Number(totalRows[0]?.count ?? 0) },
    )
  },
)
