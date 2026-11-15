import {
  type AuditChanges,
  type AuditFields,
  auditDiff,
  auditEnricher,
  type EnrichContext,
} from "evlog"

const enrichAuditContext = auditEnricher()
const normalize = (source: Record<string, unknown>, keys: string[]) =>
  Object.fromEntries(
    keys.map((key) => {
      const value = source[key]

      return [key, value instanceof Date ? value.toISOString() : value]
    }),
  )

export const resolveAuditOutcome = (status: number): AuditFields["outcome"] => {
  if (status < 400) {
    return "success"
  }

  return status === 401 || status === 403 ? "denied" : "failure"
}

export const auditChanges = (
  before: Record<string, unknown>,
  patch: Record<string, unknown>,
): AuditChanges | undefined => {
  const keys = Object.keys(patch)
  const previous = normalize(before, keys)
  const next = normalize({ ...before, ...patch }, keys)
  const diff = auditDiff(previous, next)

  if (diff.patch.length === 0) {
    return undefined
  }

  const changed = [...new Set(diff.patch.map((op) => op.path.split("/")[1] ?? ""))]

  return {
    before: normalize(previous, changed),
    after: normalize(next, changed),
    patch: diff.patch,
  }
}

export const enrichAudit = async (ctx: EnrichContext) => {
  const { audit } = ctx.event
  const cloudflareIp = ctx.headers?.["cf-connecting-ip"]

  if (audit !== undefined && cloudflareIp !== undefined && cloudflareIp !== "") {
    ctx.event.audit = { ...audit, context: { ip: cloudflareIp, ...audit.context } }
  }

  await enrichAuditContext(ctx)
}
