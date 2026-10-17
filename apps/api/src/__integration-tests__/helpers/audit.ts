import type { Services } from "../../services"

export const findAuditLogs = ({ db }: Services, action: string) =>
  db
    .selectFrom("auditLogs")
    .selectAll()
    .where("action", "=", action)
    .orderBy("createdAt", "asc")
    .execute()
