import type { MediaDocument } from "@taiyomoe/search"
import { MEDIA_STATUSES, MEDIA_TYPES, sql } from "@taiyomoe/db"
import { getPublicImageUrl } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { getMainCoverUrls } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingsQuerySchema } from "../utils/schemas"
import { isBannedSql } from "../utils/user-moderation"

const querySchema = z.object({
  q: z.string().trim().min(1).max(100).meta({ description: "The text to search for." }),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(10)
    .default(5)
    .meta({ description: "Maximum results per kind." }),
  contentRating: contentRatingsQuerySchema,
})
const quickSearchSchema = z.object({
  titles: z
    .object({
      id: z.uuid(),
      title: z.string().meta({ description: "The main title of the media." }),
      matchedTitle: z.string().nullable().meta({
        description:
          "The alternative title the query matched best, when it matched one better than the main title.",
      }),
      synopsis: z
        .record(z.string(), z.string())
        .meta({ description: "The synopsis of the media, keyed by language." }),
      type: z.enum(MEDIA_TYPES),
      status: z.enum(MEDIA_STATUSES),
      startDate: z.number().int().nullable(),
      coverUrl: z.url().nullable(),
    })
    .array(),
  groups: z
    .object({
      id: z.uuid(),
      name: z.string(),
      description: z.string().nullable(),
      logoUrl: z.url().nullable(),
    })
    .array(),
  users: z
    .object({
      id: z.uuid(),
      username: z.string(),
      displayUsername: z.string(),
      image: z.string().nullable(),
    })
    .array(),
})

export const quickSearchHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "Quick search",
    description:
      "Searches titles, groups and users at once and returns the best few of each, for type-ahead UIs such as the command palette. Titles go through the typo-tolerant media index and respect `contentRating`; groups and users match on name, exact and prefix matches first. Banned users are never returned.\n\n**Authentication:** none.",
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
        429: "Too many requests — slow down.",
      }),
    },
  }),
  rateLimit({ prefix: "quick-search", windowMs: 60_000, limit: 240 }),
  validateQuery(querySchema),
  async (c) => {
    const { db, meili, mediasIndex } = c.var
    const { q, limit, contentRating } = c.var.query
    const pattern = `%${q.replace(/[\\%_]/g, "\\$&")}%`
    const prefix = `${q.replace(/[\\%_]/g, "\\$&")}%`
    const [titleHits, groups, users] = await Promise.all([
      meili.index<MediaDocument>(mediasIndex).search(q, {
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
      }),
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
        .select(["users.id", "users.username", "users.displayUsername", "users.image"])
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
    const covers = await getMainCoverUrls(
      db,
      titleHits.hits.map((hit) => hit.id),
    )

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
