import { Hono } from "hono"
import { getAuditLogHandler } from "../handlers/get-audit-log-handler"
import { listAuditLogsHandler } from "../handlers/list-audit-logs-handler"

export const auditLogsRouter = new Hono()
  .route("/", listAuditLogsHandler)
  .route("/", getAuditLogHandler)
