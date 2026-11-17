import { MEDIA_STATUSES, MEDIA_TYPES } from "@taiyomoe/db"
import { getBannerUrl } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getMainCoverUrls, getMainTitles } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema } from "../utils/schemas"

const managedFeaturedMediaSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the media." }),
  title: z
    .string()
    .nullable()
    .meta({ description: "The main title of the media, if any.", example: "Eleceed" }),
  coverUrl: z.url().nullable().meta({ description: "The URL of the main cover, if any." }),
  bannerUrl: z
    .url()
    .nullable()
    .meta({ description: "The URL of the banner the home page shows, if any." }),
  type: z.enum(MEDIA_TYPES).meta({ description: "The type of the media.", example: "MANHWA" }),
  status: z
    .enum(MEDIA_STATUSES)
    .meta({ description: "The release status of the media.", example: "RELEASING" }),
  contentRating: contentRatingSchema("The content rating of the media."),
  deletedAt: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When the media was deleted, if it was." }),
})

export const listManagedFeaturedMediasHandler = new Hono().get(
  "/featured/managed",
  describeRoute({
    summary: "List the featured medias to manage",
    description:
      "Lists every media featured on the home page in the order it shows them, with its banner, including the ones a viewer's content filter or a deletion hides from the home page.\n\n**Required roles:** admin.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "The featured medias.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(managedFeaturedMediaSchema.array())),
          },
        },
      },
      ...getOpenApiResponses({ 401: true, 403: true }),
    },
  }),
  withAuth("media.feature"),
  async (c) => {
    const { db } = c.var
    const rows = await db
      .selectFrom("featuredMedias")
      .innerJoin("medias", "medias.id", "featuredMedias.mediaId")
      .leftJoinLateral(
        (eb) =>
          eb
            .selectFrom("banners")
            .select(["banners.id", "banners.extension"])
            .whereRef("banners.mediaId", "=", "medias.id")
            .where("banners.deletedAt", "is", null)
            .orderBy("banners.createdAt", "desc")
            .limit(1)
            .as("banner"),
        (join) => join.onTrue(),
      )
      .select([
        "medias.id",
        "medias.type",
        "medias.status",
        "medias.contentRating",
        "medias.deletedAt",
        "banner.id as bannerId",
        "banner.extension as bannerExtension",
      ])
      .orderBy("featuredMedias.position", "asc")
      .execute()
    const mediaIds = rows.map((row) => row.id)
    const [titles, coverUrls] = await Promise.all([
      getMainTitles(db, mediaIds),
      getMainCoverUrls(db, mediaIds),
    ])

    return c.ok(
      rows.map(({ bannerId, bannerExtension, ...row }) => ({
        ...row,
        title: titles.get(row.id) ?? null,
        coverUrl: coverUrls.get(row.id) ?? null,
        bannerUrl:
          bannerId === null || bannerExtension === null
            ? null
            : getBannerUrl(row.id, bannerId, bannerExtension),
      })),
    )
  },
)
