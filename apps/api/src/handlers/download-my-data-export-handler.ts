import { userExportAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { getDataExportFileName } from "@taiyomoe/queue"
import { getDataExportKey, getPresignedDownloadUrl } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { toDataExport } from "../utils/data-exports"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"
import { isSessionFresh } from "../utils/session-freshness"

const paramSchema = z.object({ id: z.uuid().meta({ description: "The ID of the export." }) })

export const downloadMyDataExportHandler = new Hono().post(
  "/me/data-exports/:id/download",
  describeRoute({
    summary: "Download my data export",
    description: `Returns a link to download a ready export, valid for ${config.dataExports.downloadUrlTtlSeconds} seconds. Each link is recorded, and it needs a sign-in from the last day.\n\n**Authentication:** signed-in user.`,
    tags: ["Your data"],
    responses: {
      201: {
        description: "Download link created.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  url: z.url().meta({ description: "The link to the archive." }),
                  expiresAt: z.iso.datetime().meta({ description: "When the link stops working." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You are banned, or you last signed in more than a day ago: sign in again first.",
        404: "You have no data export with the given ID.",
        409: "The export is not ready yet, failed or expired.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(userExportAudit.DOWNLOAD),
  withAuth(),
  validateParam(paramSchema),
  async (c) => {
    const { db, s3, s3PrivateBucket, user } = c.var
    const { id } = c.var.param

    if (!(await isSessionFresh(db, c.var.session.id))) {
      return c.fail("SESSION_NOT_FRESH")
    }

    const row = await db
      .selectFrom("dataExports")
      .select(["id", "status", "createdAt", "finishedAt", "expiresAt", "byteSize"])
      .where("id", "=", id)
      .where("userId", "=", user.id)
      .executeTakeFirst()

    if (row === undefined) {
      return c.fail("DATA_EXPORT_NOT_FOUND")
    }

    if (toDataExport(row).status !== "READY" || row.finishedAt === null) {
      return c.fail("DATA_EXPORT_NOT_READY")
    }

    const ttl = config.dataExports.downloadUrlTtlSeconds
    const url = await getPresignedDownloadUrl(
      s3,
      s3PrivateBucket,
      getDataExportKey(user.id, id),
      getDataExportFileName(row.finishedAt),
      ttl,
    )

    c.var.audit.set({ target: { userId: user.id } })

    return c.ok({ url, expiresAt: new Date(Date.now() + ttl * 1000).toISOString() })
  },
)
