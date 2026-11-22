import { MEDIA_COUNTRIES_OF_ORIGIN, sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { groupBy } from "remeda"
import z from "zod"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { getMainCoverUrls, selectVisibleChapters } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingSchema,
  contentRatingsQuerySchema,
} from "../utils/schemas"

const GROUP_MEDIA_SORTS = ["recent", "chapters", "title"] as const
const querySchema = paginationQuerySchema.extend({
  contentRating: contentRatingsQuerySchema,
  sort: z.enum(GROUP_MEDIA_SORTS).default("recent").meta({
    description:
      "How to order the medias: `recent` puts the latest release by the group first, `chapters` the most chapters by the group first, and `title` sorts by main title from A to Z. Defaults to `recent`.",
    example: "chapters",
  }),
})
const itemSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the media." }),
  title: z
    .string()
    .nullable()
    .meta({ description: "The main title of the media, if any.", example: "Vinland Saga" }),
  coverUrl: z.url().nullable().meta({ description: "The URL of the media's main cover, if any." }),
  countryOfOrigin: z
    .enum(MEDIA_COUNTRIES_OF_ORIGIN)
    .meta({ description: "The country the media originates from.", example: "JAPAN" }),
  contentRating: contentRatingSchema("The content rating of the media."),
  authors: z
    .string()
    .array()
    .meta({
      description: "The names of the media's authors, alphabetically.",
      example: ["Makoto Yukimura"],
    }),
  chapterCount: z.int().meta({
    description: "The number of matching chapters of the media credited to the group.",
    example: 54,
  }),
  latestNumber: z.number().meta({
    description: "The highest chapter number of the media released by the group.",
    example: 212,
  }),
  latestAt: z.iso.datetime().meta({
    description: "When the group's latest chapter of the media was released.",
  }),
})

export const listGroupMediasHandler = new Hono().get(
  "/:id/medias",
  describeRoute({
    summary: "List a group's medias",
    description:
      "Lists the medias the group has published chapters for, with its chapter count and latest release for each. Only chapters matching the content ratings count.\n\n**Authentication:** none.",
    tags: ["Groups"],
    responses: {
      200: {
        description: "The medias of the group.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(itemSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given ID exists.",
        422: "The provided ID is not a valid UUID, or the query parameters failed validation.",
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
    const authorsByMedia = groupBy(authors, (author) => author.mediaId)

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
