import { FLAGS, MEDIA_STATUSES, MEDIA_TYPES, sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { escapeLike } from "../utils/escape-like"
import { getMainCoverUrls, getMainTitles } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).max(100).optional().meta({
    description: "Only list the medias with a title containing this text.",
    example: "one punch",
  }),
  type: z
    .enum(MEDIA_TYPES)
    .optional()
    .meta({ description: "Only list the medias of this type.", example: "MANHWA" }),
  status: z
    .enum(MEDIA_STATUSES)
    .optional()
    .meta({ description: "Only list the medias with this release status.", example: "FINISHED" }),
  deleted: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .default(false)
    .catch(false)
    .meta({
      description: "List the deleted medias (`true`) instead of the live ones (`false`).",
      example: "true",
    }),
})
const managedMediaSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the media." }),
  title: z
    .string()
    .nullable()
    .meta({ description: "The main title of the media, if any.", example: "One Punch Man" }),
  coverUrl: z.url().nullable().meta({ description: "The URL of the main cover, if any." }),
  type: z.enum(MEDIA_TYPES).meta({ description: "The type of the media.", example: "MANGA" }),
  status: z
    .enum(MEDIA_STATUSES)
    .meta({ description: "The release status of the media.", example: "RELEASING" }),
  contentRating: contentRatingSchema("The content rating of the media."),
  flag: z.enum(FLAGS).meta({ description: "The moderation flag of the media.", example: "OK" }),
  chapterCount: z
    .int()
    .meta({ description: "The number of published chapters of the media.", example: 214 }),
  createdAt: z.iso.datetime().meta({ description: "When the media was created." }),
  updatedAt: z.iso.datetime().meta({ description: "When the media was last updated." }),
  deletedAt: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When the media was deleted, if it was." }),
})

export const listManagedMediasHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List medias",
    description:
      "Lists medias for management, newest first, with their main title and cover and their number of published chapters. Only admins can list the deleted medias.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "The matching medias.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(managedMediaSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You do not have the required role, or you listed the deleted medias without being an admin.",
        422: "The query parameters failed validation.",
      }),
    },
  }),
  withAuth("media.update"),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const { page, perPage, search, type, status, deleted } = c.var.query

    if (deleted && !c.var.can("media.restore")) {
      return c.fail("FORBIDDEN")
    }

    const base = db
      .selectFrom("medias")
      .where("medias.deletedAt", deleted ? "is not" : "is", null)
      .where((eb) => (type === undefined ? eb.and([]) : eb("medias.type", "=", type)))
      .where((eb) => (status === undefined ? eb.and([]) : eb("medias.status", "=", status)))
      .where((eb) =>
        search === undefined
          ? eb.and([])
          : eb.exists(
              eb
                .selectFrom("titles")
                .select("titles.mediaId")
                .whereRef("titles.mediaId", "=", "medias.id")
                .where("titles.deletedAt", "is", null)
                .where("titles.title", "ilike", `%${escapeLike(search)}%`),
            ),
      )
    const [rows, totalRow] = await Promise.all([
      base
        .select((eb) => [
          "medias.id",
          "medias.type",
          "medias.status",
          "medias.contentRating",
          "medias.flag",
          "medias.createdAt",
          "medias.updatedAt",
          "medias.deletedAt",
          eb
            .selectFrom("chapters")
            .select(sql<number>`count(*)::int`.as("count"))
            .whereRef("chapters.mediaId", "=", "medias.id")
            .where("chapters.deletedAt", "is", null)
            .where("chapters.status", "=", "PUBLISHED")
            .as("chapterCount"),
        ])
        .orderBy(deleted ? "medias.deletedAt" : "medias.createdAt", "desc")
        .orderBy("medias.id", "desc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      base.select(sql<string>`count(*)`.as("count")).executeTakeFirstOrThrow(),
    ])
    const mediaIds = rows.map((row) => row.id)
    const [titles, coverUrls] = await Promise.all([
      getMainTitles(db, mediaIds),
      getMainCoverUrls(db, mediaIds),
    ])

    return c.ok(
      rows.map((row) => ({
        ...row,
        title: titles.get(row.id) ?? null,
        coverUrl: coverUrls.get(row.id) ?? null,
        chapterCount: row.chapterCount ?? 0,
      })),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
