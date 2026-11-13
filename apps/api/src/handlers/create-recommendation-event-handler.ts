import { RECOMMENDATION_SURFACES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const surfaceSchema = z.enum(RECOMMENDATION_SURFACES).meta({
  description: "`RELATED`: a media's related tab. `FOR_YOU`: the home page recommendations.",
})
const sourceMediaIdSchema = z
  .uuid()
  .nullable()
  .default(null)
  .meta({ description: "The media whose related tab showed the titles, for `RELATED`." })
const eventSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("IMPRESSION"),
    surface: surfaceSchema,
    sourceMediaId: sourceMediaIdSchema,
    mediaIds: z.uuid().array().min(1).max(50).meta({ description: "The titles shown, in order." }),
  }),
  z.object({
    kind: z.literal("CLICK"),
    surface: surfaceSchema,
    sourceMediaId: sourceMediaIdSchema,
    mediaId: z.uuid().meta({ description: "The title opened." }),
    position: z.int().min(0).max(49).meta({ description: "Its zero-based position in the list." }),
  }),
])

// oxlint-disable-next-line taiyo/require-audited-route
export const createRecommendationEventHandler = new Hono().post(
  "/events",
  describeRoute({
    summary: "Record a recommendation event",
    description:
      "Records that recommendations were shown or that one was opened, to measure how well they work. Signed-in readers are recorded with their account.\n\n**Authentication:** none.",
    tags: ["Recommendations"],
    requestBody: {
      content: { "application/json": await resolver(eventSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "The event was recorded.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ recorded: z.boolean() }))),
          },
        },
      },
      ...getOpenApiResponses({
        422: "The request data failed validation.",
        429: "Too many events from this reader.",
      }),
    },
  }),
  withOptionalAuth,
  rateLimit({ prefix: "recommendation-events", windowMs: 60_000, limit: 120 }),
  validateJson(eventSchema),
  async (c) => {
    const { db, viewer, json: event } = c.var
    const referenced = [
      ...(event.sourceMediaId === null ? [] : [event.sourceMediaId]),
      ...(event.kind === "CLICK" ? [event.mediaId] : []),
    ]
    const existing =
      referenced.length === 0
        ? []
        : await db.selectFrom("medias").select("id").where("id", "in", referenced).execute()
    const exists = (id: string | null) => id !== null && existing.some((media) => media.id === id)
    const base = {
      surface: event.surface,
      sourceMediaId: exists(event.sourceMediaId) ? event.sourceMediaId : null,
      userId: viewer?.id ?? null,
    }

    if (event.kind === "IMPRESSION") {
      await db
        .insertInto("recommendationImpressions")
        .values({ ...base, mediaIds: [...new Set(event.mediaIds)] })
        .execute()

      return c.ok({ recorded: true })
    }

    if (!exists(event.mediaId)) {
      return c.ok({ recorded: false })
    }

    await db
      .insertInto("recommendationClicks")
      .values({ ...base, mediaId: event.mediaId, position: event.position })
      .execute()

    return c.ok({ recorded: true })
  },
)
