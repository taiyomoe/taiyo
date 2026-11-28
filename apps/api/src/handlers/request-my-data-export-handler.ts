import { userExportAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { corsAllowedOrigins } from "../env"
import { audited } from "../middlewares/audited-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { dataExportSchema, getNextDataExportAt, toDataExport } from "../utils/data-exports"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"
import { isSessionFresh } from "../utils/session-freshness"

export const requestMyDataExportHandler = new Hono().post(
  "/me/data-exports",
  describeRoute({
    summary: "Request a copy of my data",
    description: `Requests an archive of everything Taiyō holds about your account. It is prepared in the background: you get an email and a notification once it is ready, and it is deleted ${config.dataExports.expiryDays} days later. You can ask once every ${config.dataExports.cooldownHours} hours, and it needs a sign-in from the last day.\n\n**Authentication:** signed-in user.`,
    tags: ["Your data"],
    responses: {
      201: {
        description: "Export requested.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(dataExportSchema)) } },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You are banned, or you last signed in more than a day ago: sign in again first.",
        409: "You already asked for a copy in the last day: `details.retryAt` says when you can ask again.",
      }),
    },
  }),
  audited(userExportAudit.REQUEST, () => ({})),
  withAuth(),
  withTransaction,
  async (c) => {
    const { db, user, dataExportQueue, log } = c.var

    if (!(await isSessionFresh(db, c.var.session.id))) {
      return c.fail("SESSION_NOT_FRESH")
    }

    // Two requests at once both see no recent export: the lock makes the second wait for the first.
    await db.selectFrom("users").select("id").where("id", "=", user.id).forUpdate().execute()

    const retryAt = await getNextDataExportAt(db, user.id)

    if (retryAt !== null) {
      return c.fail("DATA_EXPORT_COOLDOWN", { retryAt: retryAt.toISOString() })
    }

    const created = await db
      .insertInto("dataExports")
      .values({ userId: user.id })
      .returning(["id", "status", "createdAt", "finishedAt", "expiresAt", "byteSize"])
      .executeTakeFirstOrThrow()
    const origin = corsAllowedOrigins[0]

    c.var.audit.set({ target: { id: created.id, userId: user.id } })
    log.set({ dataExport: { id: created.id } })
    c.var.afterCommit(() =>
      dataExportQueue.enqueue({
        exportId: created.id,
        settingsUrl: origin === undefined ? null : `${origin}/settings?tab=privacy`,
      }),
    )

    return c.ok(toDataExport(created))
  },
)
