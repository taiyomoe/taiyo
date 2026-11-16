import { mangaDexSyncAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { MANGADEX_SYNC_STATUSES, sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { loadMangaDexPlan } from "../middlewares/load-mangadex-plan-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { auditChanges } from "../utils/audit"
import { applyMangaDexPlan } from "../utils/mangadex-sync"
import { lockMedia } from "../utils/media-edit"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const startMangaDexSyncSchema = z.object({
  mangaDexId: z.uuid().optional().meta({
    description:
      "The ID of the MangaDex entry, for a media that is not linked to MangaDex yet. The media is then linked to it.",
    example: "b0b721ff-c388-4486-aa0f-c2b0bb321512",
  }),
  keys: z
    .string()
    .max(200)
    .array()
    .min(1)
    .max(config.mangaDex.maxSelectedItems)
    .meta({
      description:
        "The keys of the items to import, as the comparison lists them. Keys of items Taiyō no longer misses are ignored.",
      example: [
        "title:en:frieren: beyond journey's end",
        "chapter:6e04e431-fc6b-4e38-b952-6232c72df112",
      ],
    }),
})

export const startMangaDexSyncHandler = new Hono().post(
  "/:id/mangadex-sync",
  describeRoute({
    summary: "Sync a media with MangaDex",
    description:
      "Adds the chosen titles, synopses, staff, tags, links and fields to the media right away, then queues the chosen covers and chapters, which a worker downloads from MangaDex one by one. Missing authors, artists and scanlation groups are created, groups without an owner. Imported chapters are published under the caller's name with their MangaDex release date.\n\n**Required roles:** uploader, admin.",
    tags: ["MangaDex sync"],
    responses: {
      201: {
        description: "Sync started.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the sync." }),
                  status: z.enum(MANGADEX_SYNC_STATUSES).meta({
                    description:
                      "`PENDING` while covers or chapters are queued, `FINISHED` when there were none.",
                  }),
                  summary: z.record(z.string(), z.int()).meta({
                    description:
                      "How many titles, synopses, staff, tags, links and fields were added.",
                  }),
                  queued: z.object({
                    covers: z.int().meta({ description: "Covers queued." }),
                    chapters: z.int().meta({ description: "Chapters queued." }),
                  }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No media with the given ID exists, or MangaDex has no entry with this ID.",
        409: "A sync is already running for the media, the media is linked to another MangaDex entry, or one of the links belongs to another media.",
        422: "The provided ID is not a valid UUID, the request body failed validation, or the media has no MangaDex link and no `mangaDexId` was given.",
        451: "The media is locked, so nothing can be synced to it.",
        429: "Too many requests, try again later.",
        502: "MangaDex could not be reached.",
      }),
    },
  }),
  audited(mangaDexSyncAudit.START),
  withAuth("media.syncMangaDex"),
  rateLimit({ prefix: "mangadex-sync", windowMs: 60_000, limit: 10 }),
  validateJson(startMangaDexSyncSchema),
  checkMedia({ refuseLocked: true }),
  loadMangaDexPlan,
  withTransaction,
  async (c) => {
    const { db, media, mangaDexId, mangaDexPlan, user } = c.var

    if ((await lockMedia(db, media.id)) === undefined) {
      return c.fail("MEDIA_NOT_FOUND")
    }

    const active = await db
      .selectFrom("mangaDexSyncs")
      .select("id")
      .where("mediaId", "=", media.id)
      .where("status", "in", ["PENDING", "RUNNING"])
      .executeTakeFirst()

    if (active !== undefined) {
      return c.fail("MANGADEX_SYNC_IN_PROGRESS", { syncId: active.id })
    }

    const result = await applyMangaDexPlan(db, {
      mediaId: media.id,
      userId: user.id,
      mangaDexId,
      plan: mangaDexPlan,
      keys: new Set(c.var.json.keys),
    })

    if (result.error?.code === "MEDIA_LINK_CONFLICT") {
      return c.fail(result.error.code, result.error.details)
    }

    if (result.error !== null) {
      return c.fail(result.error.code)
    }

    const { items, summary } = result
    const queued = items.length > 0
    const sync = await db
      .insertInto("mangaDexSyncs")
      .values({
        mediaId: media.id,
        userId: user.id,
        mangaDexId,
        summary,
        status: queued ? "PENDING" : "FINISHED",
        finishedAt: queued ? null : sql<Date>`CURRENT_TIMESTAMP`,
      })
      .returning(["id", "status"])
      .executeTakeFirstOrThrow()

    for (let start = 0; start < items.length; start += 500) {
      await db
        .insertInto("mangaDexSyncItems")
        .values(
          items.slice(start, start + 500).map((item, index) => ({
            ...item,
            syncId: sync.id,
            position: start + index,
          })),
        )
        .execute()
    }

    if (queued) {
      c.var.afterCommit(() => c.var.mangaDexSyncQueue.enqueue({ syncId: sync.id }))
    }

    const covers = items.filter((item) => item.kind === "COVER").length

    c.var.audit.set({
      target: { syncId: sync.id, mangaDexId, covers, chapters: items.length - covers },
      changes: auditChanges(result.current, result.edit),
    })

    return c.ok({
      id: sync.id,
      status: sync.status,
      summary,
      queued: { covers, chapters: items.length - covers },
    })
  },
)
