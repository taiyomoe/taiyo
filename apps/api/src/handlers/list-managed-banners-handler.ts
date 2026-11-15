import { sql } from "@taiyomoe/db"
import { getBannerUrl } from "@taiyomoe/s3"
import { paginationMetaSchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { escapeLike } from "../utils/escape-like"
import { getMainTitles } from "../utils/latest-chapters"
import { managedImageSchema, managedImagesQuerySchema } from "../utils/managed-images"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const listManagedBannersHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List banners",
    description:
      "Lists the banners of every media for management, newest first, with their media and uploader.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Banners"],
    responses: {
      200: {
        description: "The matching banners.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(managedImageSchema.array(), paginationMetaSchema)),
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
  validateQuery(managedImagesQuerySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage, search, mediaId, contentRating } = c.var.query
    const base = db
      .selectFrom("banners")
      .innerJoin("medias", "medias.id", "banners.mediaId")
      .innerJoin("users", "users.id", "banners.uploaderId")
      .where("banners.deletedAt", "is", null)
      .where("medias.deletedAt", "is", null)
      .where((eb) => (mediaId === undefined ? eb.and([]) : eb("banners.mediaId", "=", mediaId)))
      .where((eb) =>
        contentRating === undefined ? eb.and([]) : eb("banners.contentRating", "=", contentRating),
      )
      .where((eb) =>
        search === undefined
          ? eb.and([])
          : eb.exists(
              eb
                .selectFrom("titles")
                .select("titles.mediaId")
                .whereRef("titles.mediaId", "=", "banners.mediaId")
                .where("titles.deletedAt", "is", null)
                .where("titles.title", "ilike", `%${escapeLike(search)}%`),
            ),
      )
    const [rows, totalRow] = await Promise.all([
      base
        .select((eb) => [
          "banners.id",
          "banners.mediaId",
          "banners.extension",
          "banners.contentRating",
          "banners.createdAt",
          "users.id as uploaderId",
          "users.username",
          "users.displayUsername",
          "users.image",
          "users.nameEffect",
          "users.avatarBorder",
          eb
            .selectFrom("banners as siblings")
            .select(sql<number>`count(*)::int`.as("count"))
            .whereRef("siblings.mediaId", "=", "banners.mediaId")
            .where("siblings.deletedAt", "is", null)
            .as("imageCount"),
        ])
        .orderBy("banners.createdAt", "desc")
        .orderBy("banners.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(sql<string>`count(*)`.as("count")).executeTakeFirstOrThrow(),
    ])
    const titles = await getMainTitles(db, [...new Set(rows.map((row) => row.mediaId))])

    return c.ok(
      rows.map((row) => ({
        id: row.id,
        url: getBannerUrl(row.mediaId, row.id, row.extension),
        contentRating: row.contentRating,
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
