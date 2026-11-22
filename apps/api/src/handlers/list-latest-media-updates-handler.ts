import { sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { groupBy, omit } from "remeda"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import {
  getMainCoverUrls,
  getMainTitles,
  selectLatestChapters,
  selectVisibleChapters,
  withChapterDetails,
} from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingsQuerySchema,
  latestMediaUpdateSchema,
} from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  contentRating: contentRatingsQuerySchema,
  chaptersPerMedia: z.coerce.number().int().min(1).max(20).default(5).meta({
    description: "The number of matching chapters to include per media, from 1 to 20.",
    example: 5,
  }),
  uploaderId: z.uuid().optional().meta({
    description: "The ID of a user, to only list the chapters they uploaded.",
    example: "2b7e9c14-5d3a-4f6b-8e1c-9a0d3f5b7c21",
  }),
  groupId: z.uuid().optional().meta({
    description: "The ID of a group, to only list the chapters credited to it.",
    example: "8d2f5a61-0c3b-4e7a-9f14-2b6c7d8e9f01",
  }),
  mediaId: z.uuid().optional().meta({
    description: "The ID of a media, to only list its chapters.",
    example: "4e26b80f-6661-4f5f-93b4-6dfed052bbed",
  }),
  search: z.string().trim().min(1).max(100).optional().meta({
    description:
      "Text to only list the chapters whose title, number or media title matches, up to 100 characters.",
    example: "boruto",
  }),
  order: z.enum(["latest", "oldest"]).default("latest").meta({
    description:
      "How to sort medias and their chapters: `latest` puts the newest releases first, `oldest` the earliest ones. Defaults to `latest`.",
    example: "latest",
  }),
})

export const listLatestMediaUpdatesHandler = new Hono().get(
  "/latest/medias",
  describeRoute({
    summary: "List the latest updates by media",
    description:
      "Lists the medias with the most recently released chapters, newest first by default, each with its latest chapters. Chapters are filtered by content rating and optionally by uploader, group, media or a search on their title, number or media title; a media shows up when at least one of its chapters matches.\n\n**Authentication:** none.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "The matching medias.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(latestMediaUpdateSchema.array(), paginationMetaSchema),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        422: "The query parameters failed validation.",
      }),
    },
  }),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const {
      page,
      perPage,
      contentRating,
      chaptersPerMedia,
      uploaderId,
      groupId,
      mediaId,
      search,
      order,
    } = c.var.query
    const filters = { contentRatings: contentRating, uploaderId, groupId, mediaId, search }
    const direction = order === "latest" ? "desc" : "asc"
    const [updates, totalRow] = await Promise.all([
      selectVisibleChapters(db, filters)
        .groupBy(["medias.id", "medias.countryOfOrigin", "medias.contentRating"])
        .select((eb) => [
          "medias.id",
          "medias.countryOfOrigin",
          "medias.contentRating",
          (order === "latest"
            ? eb.fn.max("chapters.createdAt")
            : eb.fn.min("chapters.createdAt")
          ).as("latestAt"),
          eb.fn.countAll<string>().as("chapterCount"),
        ])
        .orderBy("latestAt", direction)
        .orderBy("medias.id", direction)
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      selectVisibleChapters(db, filters)
        .select((eb) => eb.fn.count("chapters.mediaId").distinct().as("count"))
        .executeTakeFirstOrThrow(),
    ])
    const mediaIds = updates.map((update) => update.id)
    const rows =
      mediaIds.length === 0
        ? []
        : await db
            .selectFrom(
              selectLatestChapters(db, filters)
                .where("chapters.mediaId", "in", mediaIds)
                .select(
                  sql<number>`row_number() over (partition by ${sql.ref("chapters.mediaId")} order by ${sql.ref("chapters.createdAt")} ${sql.raw(direction)}, ${sql.ref("chapters.id")} ${sql.raw(direction)})`.as(
                    "rank",
                  ),
                )
                .as("ranked"),
            )
            .selectAll()
            .where("rank", "<=", chaptersPerMedia)
            .orderBy("createdAt", direction)
            .orderBy("id", direction)
            .execute()
    const [chapters, coverUrls, titles] = await Promise.all([
      withChapterDetails(db, rows),
      getMainCoverUrls(db, mediaIds),
      getMainTitles(db, mediaIds),
    ])
    const chaptersByMedia = groupBy(chapters, (chapter) => chapter.mediaId)

    return c.ok(
      updates.map((update) => ({
        id: update.id,
        title: titles.get(update.id) ?? null,
        coverUrl: coverUrls.get(update.id) ?? null,
        countryOfOrigin: update.countryOfOrigin,
        contentRating: update.contentRating,
        chapterCount: Number(update.chapterCount),
        chapters: (chaptersByMedia[update.id] ?? []).map((chapter) =>
          omit(chapter, ["mediaId", "rank"]),
        ),
      })),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
