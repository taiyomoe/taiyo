import { mangaDexSyncAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid().meta({ description: "The ID of the sync." }) })

export const cancelMangaDexSyncHandler = new Hono().post(
  "/:id/cancel",
  describeRoute({
    summary: "Cancel a MangaDex sync",
    description:
      "Stops a queued or running sync. The cover or chapter being imported still finishes; the ones after it are skipped. What was already imported stays.\n\n**Required roles:** uploader, admin.",
    tags: ["MangaDex sync"],
    responses: {
      201: {
        description: "Sync cancelled.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ id: z.uuid().meta({ description: "The ID of the sync." }) }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No sync with the given ID exists.",
        409: "The sync has already ended.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(mangaDexSyncAudit.CANCEL),
  withAuth("media.syncMangaDex"),
  validateParam(paramSchema),
  withTransaction,
  async (c) => {
    const { db } = c.var
    const { id } = c.var.param
    const cancelled = await db
      .updateTable("mangaDexSyncs")
      .set({
        status: "CANCELLED",
        finishedAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where("id", "=", id)
      .where("status", "in", ["PENDING", "RUNNING"])
      .returning(["id", "mediaId"])
      .executeTakeFirst()

    if (cancelled === undefined) {
      const exists = await db
        .selectFrom("mangaDexSyncs")
        .select("id")
        .where("id", "=", id)
        .executeTakeFirst()

      return c.fail(
        exists === undefined ? "MANGADEX_SYNC_NOT_FOUND" : "MANGADEX_SYNC_ALREADY_SETTLED",
      )
    }

    await db
      .updateTable("mangaDexSyncItems")
      .set({ status: "SKIPPED", error: "Cancelled", updatedAt: sql`CURRENT_TIMESTAMP` })
      .where("syncId", "=", id)
      .where("status", "=", "PENDING")
      .execute()

    c.var.audit.set({ target: { mediaId: cancelled.mediaId } })

    return c.ok({ id })
  },
)
