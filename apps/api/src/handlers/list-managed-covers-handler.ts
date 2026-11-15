import { MEDIA_LANGUAGES, sql } from "@taiyomoe/db"
import { getCoverUrl } from "@taiyomoe/s3"
import { paginationMetaSchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { escapeLike } from "../utils/escape-like"
import { getMainTitles } from "../utils/latest-chapters"
import { managedImageSchema, managedImagesQuerySchema } from "../utils/managed-images"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, storedLanguageSchema } from "../utils/schemas"

const querySchema = managedImagesQuerySchema.extend({
  language: z
    .enum(MEDIA_LANGUAGES)
    .optional()
    .meta({ description: "Only list the covers in this language.", example: "ja" }),
})
const managedCoverSchema = managedImageSchema.extend({
  volume: z
    .string()
    .nullable()
    .meta({ description: "The volume the cover belongs to, if any.", example: "1" }),
  language: storedLanguageSchema("The language of the cover."),
  isMainCover: z
    .boolean()
    .meta({ description: "Whether the cover is the main cover of the media.", example: false }),
})

export const listManagedCoversHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List covers",
    description:
      "Lists the covers of every media for management, newest first, with their media and uploader.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Covers"],
    responses: {
      200: {
        description: "The matching covers.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(managedCoverSchema.array(), paginationMetaSchema)),
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
  withAuth("media.update"),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage, search, mediaId, contentRating, language } = c.var.query
    const base = db
      .selectFrom("covers")
      .innerJoin("medias", "medias.id", "covers.mediaId")
      .innerJoin("users", "users.id", "covers.uploaderId")
      .where("covers.deletedAt", "is", null)
      .where("medias.deletedAt", "is", null)
      .where((eb) => (mediaId === undefined ? eb.and([]) : eb("covers.mediaId", "=", mediaId)))
      .where((eb) => (language === undefined ? eb.and([]) : eb("covers.language", "=", language)))
      .where((eb) =>
        contentRating === undefined ? eb.and([]) : eb("covers.contentRating", "=", contentRating),
      )
      .where((eb) =>
        search === undefined
          ? eb.and([])
          : eb.exists(
              eb
                .selectFrom("titles")
                .select("titles.mediaId")
                .whereRef("titles.mediaId", "=", "covers.mediaId")
                .where("titles.deletedAt", "is", null)
                .where("titles.title", "ilike", `%${escapeLike(search)}%`),
            ),
      )
    const [rows, totalRow] = await Promise.all([
      base
        .select((eb) => [
          "covers.id",
          "covers.mediaId",
          "covers.extension",
          "covers.volume",
          "covers.language",
          "covers.contentRating",
          "covers.isMainCover",
          "covers.createdAt",
          "users.id as uploaderId",
          "users.username",
          "users.displayUsername",
          "users.image",
          "users.nameEffect",
          "users.avatarBorder",
          eb
            .selectFrom("covers as siblings")
            .select(sql<number>`count(*)::int`.as("count"))
            .whereRef("siblings.mediaId", "=", "covers.mediaId")
            .where("siblings.deletedAt", "is", null)
            .as("imageCount"),
        ])
        .orderBy("covers.createdAt", "desc")
        .orderBy("covers.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(sql<string>`count(*)`.as("count")).executeTakeFirstOrThrow(),
    ])
    const titles = await getMainTitles(db, [...new Set(rows.map((row) => row.mediaId))])

    return c.ok(
      rows.map((row) => ({
        id: row.id,
        url: getCoverUrl(row.mediaId, row.id, row.extension),
        volume: row.volume,
        language: row.language,
        contentRating: row.contentRating,
        isMainCover: row.isMainCover,
        createdAt: row.createdAt,
        media: {
          id: row.mediaId,
          title: titles.get(row.mediaId) ?? null,
          imageCount: row.imageCount ?? 0,
        },
        uploader: {
          id: row.uploaderId,
          username: row.username,
          displayUsername: row.displayUsername,
          image: row.image,
          nameEffect: row.nameEffect,
          avatarBorder: row.avatarBorder,
        },
      })),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
