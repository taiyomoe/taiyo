import { CONTENT_RATINGS, MEDIA_COUNTRIES_OF_ORIGIN, sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { group } from "radashi"
import z from "zod"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { getMainCoverUrls, selectVisibleChapters } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingsQuerySchema } from "../utils/schemas"

const GROUP_MEDIA_SORTS = ["recent", "chapters", "title"] as const
const querySchema = paginationQuerySchema.extend({
  contentRating: contentRatingsQuerySchema,
  sort: z.enum(GROUP_MEDIA_SORTS).default("recent").meta({
    description:
      "`recent`: latest release first. `chapters`: most chapters by the group first. `title`: A to Z.",
  }),
})
const itemSchema = z.object({
  id: z.uuid(),
  title: z.string().nullable(),
  coverUrl: z.string().nullable(),
  countryOfOrigin: z.enum(MEDIA_COUNTRIES_OF_ORIGIN),
  contentRating: z.enum(CONTENT_RATINGS),
  authors: z.string().array(),
  chapterCount: z.int().meta({ description: "Chapters of this media credited to the group." }),
  latestNumber: z.number().meta({ description: "Highest chapter number released by the group." }),
  latestAt: z.iso.datetime().meta({ description: "When the group's latest chapter came out." }),
})

export const listGroupMediasHandler = new Hono().get(
  "/:id/medias",
  describeRoute({
    summary: "List the medias of a group",
    description:
      "Lists the medias the group has released chapters for, with how many chapters it released for each.\n\n**Authentication:** none.",
    tags: ["Groups"],
    responses: {
      200: {
        description: "The group's medias.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(itemSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists.",
        422: "The provided id or query parameters failed validation.",
      }),
    },
  }),
  validateQuery(querySchema),
  checkGroup(),
  async (c) => {
    const { db, group: target } = c.var
    const { page, perPage, contentRating, sort } = c.var.query
    const filters = { contentRatings: contentRating, groupId: target.id }
    const base = selectVisibleChapters(db, filters)
      .leftJoin("titles", (join) =>
        join
          .onRef("titles.mediaId", "=", "medias.id")
          .on("titles.isMainTitle", "=", true)
          .on("titles.deletedAt", "is", null),
      )
      .groupBy("medias.id")
      .select((eb) => [
        "medias.id",
        "medias.countryOfOrigin",
        "medias.contentRating",
        eb.fn.min("titles.title").as("title"),
        sql<string>`count(distinct ${sql.ref("chapters.id")})`.as("chapterCount"),
        eb.fn.max("chapters.number").as("latestNumber"),
        eb.fn.max("chapters.createdAt").as("latestAt"),
      ])
    const ordered = {
      recent: base.orderBy("latestAt", "desc"),
      chapters: base.orderBy("chapterCount", "desc").orderBy("latestAt", "desc"),
      title: base.orderBy(sql`lower(min(${sql.ref("titles.title")}))`, (ob) =>
        ob.asc().nullsLast(),
      ),
    }[sort]
    const [rows, totalRow] = await Promise.all([
      ordered
        .orderBy("medias.id", "asc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      selectVisibleChapters(db, filters)
        .select((eb) => eb.fn.count("chapters.mediaId").distinct().as("count"))
        .executeTakeFirstOrThrow(),
    ])
    const mediaIds = rows.map((row) => row.id)
    const [coverUrls, authors] = await Promise.all([
      getMainCoverUrls(db, mediaIds),
      mediaIds.length === 0
        ? []
        : db
            .selectFrom("mediaStaffs")
            .innerJoin("staffs", "staffs.id", "mediaStaffs.staffId")
            .where("mediaStaffs.mediaId", "in", mediaIds)
            .where("mediaStaffs.role", "=", "AUTHOR")
            .where("staffs.deletedAt", "is", null)
            .select(["mediaStaffs.mediaId", "staffs.name"])
            .orderBy("staffs.name", "asc")
            .execute(),
    ])
    const authorsByMedia = group(authors, (author) => author.mediaId)

    return c.ok(
      rows.map((row) => ({
        id: row.id,
        title: row.title,
        coverUrl: coverUrls.get(row.id) ?? null,
        countryOfOrigin: row.countryOfOrigin,
        contentRating: row.contentRating,
        authors: (authorsByMedia[row.id] ?? []).map((author) => author.name),
        chapterCount: Number(row.chapterCount),
        latestNumber: row.latestNumber,
        latestAt: row.latestAt,
      })),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
