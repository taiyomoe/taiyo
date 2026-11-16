import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { loadMangaDexPlan } from "../middlewares/load-mangadex-plan-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { mangaDexPlanSchema } from "../utils/mangadex-sync-schemas"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const querySchema = z.object({
  mangaDexId: z.uuid().optional().meta({
    description:
      "The ID of the MangaDex entry, for a media that is not linked to MangaDex yet. A linked media always uses its own link.",
    example: "b0b721ff-c388-4486-aa0f-c2b0bb321512",
  }),
})

export const getMangaDexPlanHandler = new Hono().get(
  "/:id/mangadex-sync",
  describeRoute({
    summary: "Compare a media with MangaDex",
    description:
      "Lists what the media's MangaDex entry has that Taiyō is missing: titles, synopses, authors and artists, tags, links, fields, covers, and chapters in English, French and Portuguese. Start a sync with the keys of the items to import.\n\n**Required roles:** uploader, admin.",
    tags: ["MangaDex sync"],
    responses: {
      200: {
        description: "What Taiyō is missing.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(mangaDexPlanSchema)) },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No media with the given ID exists, or MangaDex has no entry with this ID.",
        409: "The media is linked to another MangaDex entry, or another media is linked to this one.",
        422: "The provided ID is not a valid UUID, or the media has no MangaDex link and no `mangaDexId` was given.",
        451: "The media is locked, so nothing can be synced to it.",
        429: "Too many requests, try again later.",
        502: "MangaDex could not be reached.",
      }),
    },
  }),
  withAuth("media.syncMangaDex"),
  rateLimit({ prefix: "mangadex-plan", windowMs: 60_000, limit: 20 }),
  validateQuery(querySchema),
  checkMedia({ refuseLocked: true }),
  loadMangaDexPlan,
  (c) => c.ok(c.var.mangaDexPlan),
)
