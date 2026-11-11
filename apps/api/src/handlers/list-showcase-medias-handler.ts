import type { DB, Kysely } from "@taiyomoe/db"
import { cacheClient } from "@taiyomoe/cache"
import { getCoverUrl } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const SHOWCASE_SIZE = 16
const CACHE_TTL_SECONDS = 60 * 60
const showcaseMediaSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the media." }),
  title: z.string().meta({ description: "The main title of the media.", example: "Eleceed" }),
  coverUrl: z.url().meta({ description: "URL of the media's main cover." }),
  chapterCount: z
    .number()
    .int()
    .meta({ description: "How many chapter numbers have a published chapter.", example: 312 }),
  tags: z
    .string()
    .array()
    .meta({ description: "Keys of the media's non-spoiler tags.", example: ["ACTION", "COMEDY"] }),
})

type ShowcaseMedia = z.infer<typeof showcaseMediaSchema>

const listShowcaseMedias = async (db: Kysely<DB>) => {
  const medias = await db
    .selectFrom("medias")
    .innerJoinLateral(
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
    .where("medias.deletedAt", "is", null)
    .where("medias.contentRating", "=", "NORMAL")
    .where("medias.flag", "=", "OK")
    .select((eb) => [
      "medias.id",
      "medias.tags",
      "cover.id as coverId",
      "cover.extension as coverExtension",
      eb
        .selectFrom("titles")
        .whereRef("titles.mediaId", "=", "medias.id")
        .where("titles.isMainTitle", "=", true)
        .where("titles.deletedAt", "is", null)
        .select("titles.title")
        .limit(1)
        .as("title"),
      eb
        .selectFrom("chapters")
        .whereRef("chapters.mediaId", "=", "medias.id")
        .where("chapters.status", "=", "PUBLISHED")
        .where("chapters.deletedAt", "is", null)
        .select((sub) => sub.fn.count<string>("chapters.number").distinct().as("count"))
        .as("chapterCount"),
      eb
        .selectFrom("userLibraryEntries")
        .whereRef("userLibraryEntries.mediaId", "=", "medias.id")
        .select((sub) => sub.fn.countAll<string>().as("count"))
        .as("readerCount"),
    ])
    .orderBy("readerCount", "desc")
    .orderBy("chapterCount", "desc")
    .orderBy("medias.createdAt", "desc")
    .limit(SHOWCASE_SIZE)
    .execute()

  return medias.flatMap((media) =>
    media.title === null
      ? []
      : [
          {
            id: media.id,
            title: media.title,
            coverUrl: getCoverUrl(media.id, media.coverId, media.coverExtension),
            chapterCount: Number(media.chapterCount ?? 0),
            tags: (media.tags ?? []).filter((tag) => !tag.isSpoiler).map((tag) => tag.key),
          } satisfies ShowcaseMedia,
        ],
  )
}
// Concurrent misses share one query instead of each hitting the database.
const inFlight = new Map<string, Promise<ShowcaseMedia[]>>()

export const listShowcaseMediasHandler = new Hono().get(
  "/showcase",
  describeRoute({
    summary: "List showcase medias",
    description:
      "Lists the most followed all-audience medias that have a cover, for the public landing page. Cached for an hour.\n\n**Authentication:** none.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "The showcase medias.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(showcaseMediaSchema.array())),
          },
        },
      },
      ...getOpenApiResponses(),
    },
  }),
  async (c) => {
    const { db, cacheNamespace } = c.var
    const cacheKey = `${cacheNamespace}all`
    const cached = await cacheClient.medias.showcase.get<ShowcaseMedia[]>(cacheKey)
    const medias =
      cached ??
      (await (inFlight.get(cacheKey) ??
        (() => {
          const pending = listShowcaseMedias(db)
            .then(async (fresh) => {
              await cacheClient.medias.showcase.set(cacheKey, fresh, CACHE_TTL_SECONDS)

              return fresh
            })
            .finally(() => {
              inFlight.delete(cacheKey)
            })

          inFlight.set(cacheKey, pending)

          return pending
        })()))

    c.header("Cache-Control", "public, max-age=300, stale-while-revalidate=3600")

    return c.ok(medias)
  },
)
