import {
  MEDIA_COUNTRIES_OF_ORIGIN,
  MEDIA_DEMOGRAPHIES,
  MEDIA_SOURCES,
  MEDIA_STATUSES,
  MEDIA_TYPES,
  sql,
} from "@taiyomoe/db"
import { syncMedia } from "@taiyomoe/search"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingSchema,
  mediaLinksSchema,
  mediaSynopsisSchema,
  mediaTagsSchema,
} from "../utils/schemas"

const updateMediaSchema = z
  .object({
    type: z.enum(MEDIA_TYPES).optional().meta({ description: "The type of the media." }),
    status: z.enum(MEDIA_STATUSES).optional().meta({
      description: "The current release status of the media.",
      example: "RELEASING",
    }),
    source: z.enum(MEDIA_SOURCES).optional().meta({
      description: "The original source of the media.",
      example: "ORIGINAL",
    }),
    demography: z.enum(MEDIA_DEMOGRAPHIES).optional().meta({
      description: "The target audience of the media.",
      example: "SHOUNEN",
    }),
    countryOfOrigin: z.enum(MEDIA_COUNTRIES_OF_ORIGIN).optional().meta({
      description: "The country where the media was originally created.",
      example: "JAPAN",
    }),
    contentRating: contentRatingSchema("The content rating of the media.").optional(),
    synopsis: mediaSynopsisSchema.optional(),
    startDate: z.iso
      .datetime()
      .nullable()
      .optional()
      .meta({ description: "The release start date, or null to clear." }),
    endDate: z.iso
      .datetime()
      .nullable()
      .optional()
      .meta({ description: "The release end date, or null to clear." }),
    links: mediaLinksSchema.optional(),
    tags: mediaTagsSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  })

export const updateMediaHandler = new Hono().patch(
  "/:id",
  describeRoute({
    summary: "Update a media",
    description:
      "Updates the metadata of a media. Omitted fields are kept as-is. Send `null` explicitly to clear `startDate` or `endDate`.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Medias"],
    requestBody: {
      content: { "application/json": await resolver(updateMediaSchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Media updated.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the updated media." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists.",
        409: "One or more of the provided links already belong to another media.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("update", "Media"),
  validateJson(updateMediaSchema),
  checkMedia(),
  withTransaction,
  async (c) => {
    const { db, media } = c.var
    const body = c.var.json

    if (body.links) {
      const links = Object.entries(body.links)

      if (links.length > 0) {
        const existing = await db
          .selectFrom("medias")
          .select("id")
          .where("id", "!=", media.id)
          .where((eb) =>
            eb.or(
              links.map(
                ([key, value]) => sql<boolean>`links @> ${JSON.stringify({ [key]: value })}::jsonb`,
              ),
            ),
          )
          .limit(1)
          .executeTakeFirst()

        if (existing) {
          return c.fail("MEDIA_LINK_CONFLICT", {
            conflictingMediaId: existing.id,
            providedLinks: Object.fromEntries(links),
          })
        }
      }
    }

    const updates: Record<string, unknown> = {}

    for (const key of [
      "type",
      "status",
      "source",
      "demography",
      "countryOfOrigin",
      "contentRating",
      "synopsis",
      "tags",
      "links",
    ] as const) {
      if (body[key] !== undefined) {
        updates[key] = body[key]
      }
    }

    if (body.startDate !== undefined) {
      updates.startDate = body.startDate === null ? null : new Date(body.startDate)
    }

    if (body.endDate !== undefined) {
      updates.endDate = body.endDate === null ? null : new Date(body.endDate)
    }

    await db.updateTable("medias").set(updates).where("id", "=", media.id).execute()

    c.var.afterCommit(() => syncMedia(c.var.db, media.id))

    return c.ok({ id: media.id })
  },
)
