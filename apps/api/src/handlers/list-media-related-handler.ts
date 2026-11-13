import { MEDIA_RELATION_TYPES, type UserLibraryStatus } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { getRecommendedMedias, recommendedMediaSchema } from "../utils/recommendations"
import { apiSuccessEnvelope, contentRatingsQuerySchema } from "../utils/schemas"

const SIMILAR_LIMIT = 24
const PUSHED_DOWN_STATUSES = new Set<UserLibraryStatus>([
  "READING",
  "REREADING",
  "COMPLETED",
  "ON_HOLD",
  "DROPPED",
])
const querySchema = z.object({ contentRating: contentRatingsQuerySchema })
const relatedSchema = z.object({
  relations: recommendedMediaSchema
    .extend({
      relationType: z.enum(MEDIA_RELATION_TYPES).meta({
        description: "What this media is to the requested one: `SEQUEL` means it continues it.",
      }),
    })
    .array(),
  similar: recommendedMediaSchema
    .extend({
      reasons: z.object({
        tags: z
          .string()
          .array()
          .meta({ description: "Non-spoiler tags both medias share, most telling first." }),
        staff: z.boolean().meta({ description: "Whether both medias share an author or artist." }),
        readers: z
          .boolean()
          .meta({ description: "Whether readers of the requested media often read this one." }),
      }),
    })
    .array(),
})

export const listMediaRelatedHandler = new Hono().get(
  "/:id/related",
  describeRoute({
    summary: "List related medias",
    description: `Lists the media's sequels, prequels, side stories and other relations, then up to ${SIMILAR_LIMIT} similar medias with why each one was picked. Similar medias are recomputed every hour from tags, staff and what readers read together. For a signed-in reader, titles they already read or dropped come last.\n\n**Authentication:** none.`,
    tags: ["Medias"],
    responses: {
      200: {
        description: "The related medias.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(relatedSchema)) } },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists.",
        422: "The provided id or query parameters failed validation.",
      }),
    },
  }),
  validateQuery(querySchema),
  checkMedia(),
  withOptionalAuth,
  async (c) => {
    const { db, media, viewer } = c.var
    const { contentRating } = c.var.query
    const [relations, similarity] = await Promise.all([
      db
        .selectFrom("mediaRelations")
        .select(["relatedMediaId", "type"])
        .where("mediaId", "=", media.id)
        .execute(),
      db
        .selectFrom("mediaSimilarities")
        .select("items")
        .where("mediaId", "=", media.id)
        .executeTakeFirst(),
    ])
    const relatedIds = new Set(relations.map((relation) => relation.relatedMediaId))
    const items = (similarity?.items ?? []).filter((item) => !relatedIds.has(item.mediaId))
    const medias = await getRecommendedMedias(db, {
      mediaIds: [...relatedIds, ...items.map((item) => item.mediaId)],
      contentRatings: contentRating,
      viewerId: viewer?.id ?? null,
    })
    const similar = items.flatMap(({ mediaId, tags, staff, readers }) => {
      const card = medias.get(mediaId)

      return card === undefined ? [] : [{ ...card, reasons: { tags, staff, readers } }]
    })
    const isPushedDown = (status: UserLibraryStatus | null) =>
      status !== null && PUSHED_DOWN_STATUSES.has(status)

    return c.ok({
      relations: relations
        .flatMap(({ relatedMediaId, type }) => {
          const card = medias.get(relatedMediaId)

          return card === undefined ? [] : [{ ...card, relationType: type }]
        })
        .sort(
          (a, b) =>
            MEDIA_RELATION_TYPES.indexOf(a.relationType) -
            MEDIA_RELATION_TYPES.indexOf(b.relationType),
        ),
      similar: [
        ...similar.filter((item) => !isPushedDown(item.libraryStatus)),
        ...similar.filter((item) => isPushedDown(item.libraryStatus)),
      ].slice(0, SIMILAR_LIMIT),
    })
  },
)
