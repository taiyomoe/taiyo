import type { AuditChanges } from "evlog"
import type { Context } from "hono"
import { anonymousActor, type AuditActionEntry, userActor } from "@taiyomoe/audit"
import { createMiddleware } from "hono/factory"
import { resolveAuditOutcome } from "../utils/audit"

type AuditTargetDetails = { id?: string | undefined; [key: string]: unknown }

type AuditDetails = {
  target?: AuditTargetDetails
  changes?: AuditChanges | undefined
  reason?: string
}

export type AuditRecorder = {
  set: (details: AuditDetails) => void
}

const targetFromIdParam = (c: Context): AuditTargetDetails => ({ id: c.req.param("id") })

export const audited = (
  entry: AuditActionEntry,
  resolveTarget: (c: Context) => AuditTargetDetails = targetFromIdParam,
) =>
  createMiddleware<{ Variables: { audit: AuditRecorder } }>(async (c, next) => {
    const details: AuditDetails = {}

    c.set("audit", {
      set: ({ target, changes, reason }) => {
        if (target !== undefined) {
          details.target = { ...details.target, ...target }
        }

        if (changes !== undefined) {
          details.changes = changes
        }

        if (reason !== undefined) {
          details.reason = reason
        }
      },
    })

    await next()

    const { errorCode, log, session, user } = c.var
    const outcome = resolveAuditOutcome(c.res.status)
    const reason = outcome === "success" ? details.reason : (errorCode ?? details.reason)
    const { id, ...extra } = { ...resolveTarget(c), ...details.target }

    log.audit({
      action: entry.action,
      actor: user === undefined ? anonymousActor : userActor(user, session),
      outcome,
      ...(typeof entry.target === "string" && typeof id === "string" && id !== ""
        ? { target: { ...extra, type: entry.target, id } }
        : {}),
      ...(reason === undefined ? {} : { reason }),
      ...(details.changes === undefined || outcome !== "success"
        ? {}
        : { changes: details.changes }),
    })
  })
