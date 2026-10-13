import { getBannerUrl, getCoverUrl } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { group } from "radashi"
import z from "zod"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema } from "../utils/schemas"

const featuredMediaSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the media." }),
  title: z
    .string()
    .nullable()
    .meta({ description: "The main title of the media.", example: "Eleceed" }),
  synopsis: z
    .record(z.string(), z.string())
    .meta({ description: "The synopsis of the media, keyed by language." }),
  tags: z
    .string()
    .array()
    .meta({ description: "Keys of the media's non-spoiler tags.", example: ["ACTION", "COMEDY"] }),
  contentRating: contentRatingSchema("The content rating of the media."),
  authors: z
    .string()
    .array()
    .meta({
      description: "Names of the authors and artists credited on the media, authors first.",
      example: ["Son Jae Ho", "ZHENA"],
    }),
  coverUrl: z.url().nullable().meta({ description: "URL of the media's main cover, if any." }),
  bannerUrl: z.url().nullable().meta({ description: "URL of the media's latest banner, if any." }),
})

export const listFeaturedMediasHandler = new Hono().get(
  "/featured",
  describeRoute({
    summary: "List featured medias",
    description:
      "Lists the medias curated for the home page carousel, in display order.\n\n**Authentication:** none.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "The featured medias.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(featuredMediaSchema.array())),
          },
        },
      },
      ...getOpenApiResponses({}),
    },
  }),
  async (c) => {
    const { db } = c.var
    const medias = await db
      .selectFrom("featuredMedias")
      .innerJoin("medias", "medias.id", "featuredMedias.mediaId")
      .leftJoinLateral(
        (eb) =>
          eb
            .selectFrom("covers")
            .select(["covers.id", "covers.extension"])
            .whereRef("covers.mediaId", "=", "medias.id")
            .where("covers.isMainCover", "=", true)
            .where("covers.deletedAt", "is", null)
            .limit(1)
            .as("cover"),
        (join) => join.onTrue(),
      )
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
      .where("medias.deletedAt", "is", null)
      .select((eb) => [
        "medias.id",
        "medias.synopsis",
        "medias.tags",
        "medias.contentRating",
        "cover.id as coverId",
        "cover.extension as coverExtension",
        "banner.id as bannerId",
        "banner.extension as bannerExtension",
        eb
          .selectFrom("titles")
          .whereRef("titles.mediaId", "=", "medias.id")
          .where("titles.isMainTitle", "=", true)
          .where("titles.deletedAt", "is", null)
          .select("titles.title")
          .limit(1)
          .as("title"),
      ])
      .orderBy("featuredMedias.position", "asc")
      .orderBy("featuredMedias.createdAt", "asc")
      .execute()

    if (medias.length === 0) {
      return c.ok([])
    }

    const credits = await db
      .selectFrom("mediaStaffs")
      .innerJoin("staffs", "staffs.id", "mediaStaffs.staffId")
      .where(
        "mediaStaffs.mediaId",
        "in",
        medias.map((media) => media.id),
      )
      .where("staffs.deletedAt", "is", null)
      .select(["mediaStaffs.mediaId", "staffs.name"])
      .orderBy("mediaStaffs.role", "asc")
      .orderBy("staffs.name", "asc")
      .execute()
    const authorsByMedia = group(credits, (credit) => credit.mediaId)

    return c.ok(
      medias.map((media) => ({
        id: media.id,
        title: media.title,
        synopsis: media.synopsis,
        tags: (media.tags ?? []).filter((tag) => !tag.isSpoiler).map((tag) => tag.key),
        contentRating: media.contentRating,
        authors: [...new Set((authorsByMedia[media.id] ?? []).map((credit) => credit.name))],
        coverUrl:
          media.coverId !== null && media.coverExtension !== null
            ? getCoverUrl(media.id, media.coverId, media.coverExtension)
            : null,
        bannerUrl:
          media.bannerId !== null && media.bannerExtension !== null
            ? getBannerUrl(media.id, media.bannerId, media.bannerExtension)
            : null,
      })),
    )
  },
)
