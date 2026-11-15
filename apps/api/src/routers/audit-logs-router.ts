import { Hono } from "hono"
import { getAuditLogFacetsHandler } from "../handlers/get-audit-log-facets-handler"
import { getAuditLogHandler } from "../handlers/get-audit-log-handler"
import { getAuditLogHistogramHandler } from "../handlers/get-audit-log-histogram-handler"
import { listAuditLogGroupsHandler } from "../handlers/list-audit-log-groups-handler"
import { listAuditLogSuggestionsHandler } from "../handlers/list-audit-log-suggestions-handler"
import { listAuditLogsHandler } from "../handlers/list-audit-logs-handler"

export const auditLogsRouter = new Hono()
  .route("/", listAuditLogsHandler)
  .route("/", listAuditLogGroupsHandler)
  .route("/", getAuditLogHistogramHandler)
  .route("/", getAuditLogFacetsHandler)
  .route("/", listAuditLogSuggestionsHandler)
  .route("/", getAuditLogHandler)
