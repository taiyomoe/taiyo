import type { MediaDocument } from "@taiyomoe/search"
import { MEDIA_STATUSES, MEDIA_TYPES, sql } from "@taiyomoe/db"
import { getPublicImageUrl } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { escapeLike } from "../utils/escape-like"
import { getMainCoverUrls } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingsQuerySchema,
  storedLocalizedTextSchema,
  userSummarySchema,
} from "../utils/schemas"
import { isBannedSql } from "../utils/user-moderation"

const querySchema = z.object({
  q: z.string().trim().min(1).max(100).meta({
    description: "The text to search for, from 1 to 100 characters.",
    example: "frieren",
  }),
  limit: z.coerce.number().int().min(1).max(10).default(5).meta({
    description: "The maximum number of results of each kind, from 1 to 10. Defaults to 5.",
    example: 5,
  }),
  contentRating: contentRatingsQuerySchema,
})
const quickSearchSchema = z.object({
  titles: z
    .object({
      id: z.uuid().meta({ description: "The ID of the media." }),
      title: z
        .string()
        .meta({ description: "The main title of the media.", example: "Sousou no Frieren" }),
      matchedTitle: z.string().nullable().meta({
        description:
          "The alternative title the query matched best, when it matched one better than the main title, if any.",
        example: "Frieren: Beyond Journey's End",
      }),
      synopsis: storedLocalizedTextSchema.meta({
        description: "The synopsis of the media, keyed by language.",
      }),
      type: z.enum(MEDIA_TYPES).meta({ description: "The type of the media.", example: "MANGA" }),
      status: z
        .enum(MEDIA_STATUSES)
        .meta({ description: "The publication status of the media.", example: "RELEASING" }),
      startDate: z.int().nullable().meta({
        description: "When the media started, in milliseconds since the Unix epoch, if known.",
        example: 1_587_772_800_000,
      }),
      coverUrl: z
        .url()
        .nullable()
        .meta({ description: "The URL of the media's main cover, if any." }),
    })
    .array()
    .meta({ description: "The best matching titles, most relevant first." }),
  groups: z
    .object({
      id: z.uuid().meta({ description: "The ID of the group." }),
      name: z.string().meta({ description: "The name of the group.", example: "Sunray Scans" }),
      description: z
        .string()
        .nullable()
        .meta({ description: "The description of the group, if any." }),
      logoUrl: z.url().nullable().meta({ description: "The URL of the group's logo, if any." }),
    })
    .array()
    .meta({
      description:
        "The best matching groups: exact name matches first, then prefix matches, then by name.",
    }),
  users: userSummarySchema.array().meta({
    description:
      "The best matching users: exact username matches first, then prefix matches, then by username.",
  }),
})

export const quickSearchHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "Search titles, groups and users",
    description:
      "Searches titles, groups and users at once and returns the best few of each, for type-ahead UIs such as the command palette. Titles tolerate typos and respect `contentRating`; groups and users match on name. Banned users are never returned.\n\n**Authentication:** none.",
    tags: ["Search"],
    responses: {
      200: {
        description: "The best matches of each kind.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(quickSearchSchema)) },
        },
      },
      ...getOpenApiResponses({
        422: "The query parameters failed validation.",
        429: "Too many requests, try again later.",
      }),
    },
  }),
  rateLimit({ prefix: "quick-search", windowMs: 60_000, limit: 240 }),
  validateQuery(querySchema),
  async (c) => {
    const { db, meili, mediasIndex } = c.var
    const { q, limit, contentRating } = c.var.query
    const pattern = `%${escapeLike(q)}%`
    const prefix = `${escapeLike(q)}%`
    const [[titleHits, covers], groups, users] = await Promise.all([
      meili
        .index<MediaDocument>(mediasIndex)
        .search(q, {
          filter: `contentRating IN [${contentRating.map((rating) => `"${rating}"`).join(", ")}]`,
          attributesToRetrieve: [
            "id",
            "mainTitle",
            "titles",
            "synopsis",
            "type",
            "status",
            "startDate",
          ],
          showMatchesPosition: true,
          limit,
        })
        .then(
          async (hits) =>
            [
              hits,
              await getMainCoverUrls(
                db,
                hits.hits.map((hit) => hit.id),
              ),
            ] as const,
        ),
      db
        .selectFrom("groups")
        .select(["id", "name", "description", "logo"])
        .where("deletedAt", "is", null)
        .where("name", "ilike", pattern)
        .orderBy(
          sql`case when lower("name") = lower(${q}) then 0 when "name" ilike ${prefix} then 1 else 2 end`,
        )
        .orderBy("name", "asc")
        .limit(limit)
        .execute(),
      db
        .selectFrom("users")
        .select([
          "users.id",
          "users.username",
          "users.displayUsername",
          "users.image",
          "users.nameEffect",
          "users.avatarBorder",
        ])
        .where((eb) =>
          eb.or([
            eb("users.username", "ilike", pattern),
            eb("users.displayUsername", "ilike", pattern),
          ]),
        )
        .where(sql<boolean>`not (${isBannedSql})`)
        .orderBy(
          sql`case when lower("users"."username") = lower(${q}) then 0 when "users"."username" ilike ${prefix} or "users"."displayUsername" ilike ${prefix} then 1 else 2 end`,
        )
        .orderBy("users.username", "asc")
        .limit(limit)
        .execute(),
    ])

    return c.ok({
      titles: titleHits.hits.flatMap((hit) => {
        if (hit.mainTitle === null) {
          return []
        }

        const main = hit.mainTitle.title
        const squash = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")
        const positions: Partial<Record<string, ReadonlyArray<{ indices?: number[] }>>> =
          hit._matchesPosition ?? {}
        const counts = new Map<number, number>()

        for (const position of positions.titles ?? []) {
          for (const index of position.indices ?? []) {
            counts.set(index, (counts.get(index) ?? 0) + 1)
          }
        }

        const best = [...counts.entries()]
          .filter(([index]) => {
            const title = hit.titles[index]

            return title !== undefined && squash(title) !== squash(main)
          })
          .sort(([, a], [, b]) => b - a)[0]
        const matchedTitle =
          best !== undefined && best[1] > (positions["mainTitle.title"]?.length ?? 0)
            ? (hit.titles[best[0]] ?? null)
            : null

        return [
          {
            id: hit.id,
            title: main,
            matchedTitle,
            synopsis: hit.synopsis,
            type: hit.type,
            status: hit.status,
            startDate: hit.startDate,
            coverUrl: covers.get(hit.id) ?? null,
          },
        ]
      }),
      groups: groups.map((group) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        logoUrl: group.logo === null ? null : getPublicImageUrl(group.logo),
      })),
      users,
    })
  },
)
